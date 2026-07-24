import {
  SamlSsoConnectorSigningKeys,
  type SamlSsoConnectorSigningKey,
  samlSsoConnectorSigningKeyResponseGuard,
  SsoProviderType,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { calculateCertificateFingerprints } from '#src/libraries/saml-application/utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import assertThat from '#src/utils/assert-that.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

/** Build the response payload, making sure the private key is never serialized. */
const buildSigningKeyResponse = ({
  tenantId,
  ssoConnectorId,
  privateKey,
  ...rest
}: SamlSsoConnectorSigningKey) => ({
  ...rest,
  fingerprints: calculateCertificateFingerprints(rest.certificate),
});

export default function samlSsoConnectorSigningKeyRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [
    router,
    {
      queries: {
        samlSsoConnectorSigningKeys: {
          findSigningKeysBySsoConnectorId,
          findSigningKeyBySsoConnectorIdAndId,
          updateSigningKeyStatusBySsoConnectorIdAndId,
          deleteInactiveSigningKeyBySsoConnectorIdAndId,
        },
      },
      libraries: {
        ssoConnectors: { getSsoConnectorById },
        samlSsoConnectorSigningKeys: { createSigningKey },
      },
    },
  ] = args;

  // The signing-key surface only exists for SAML protocol connectors.
  const assertSamlConnector = async (connectorId: string) => {
    const { providerName } = await getSsoConnectorById(connectorId);

    assertThat(
      ssoConnectorFactories[providerName].providerType === SsoProviderType.SAML,
      new RequestError({ code: 'connector.not_found', status: 404 })
    );
  };

  router.get(
    '/sso-connectors/:id/signing-keys',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      response: samlSsoConnectorSigningKeyResponseGuard.array(),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await assertSamlConnector(id);

      const keys = await findSigningKeysBySsoConnectorId(id);
      ctx.status = 200;
      ctx.body = keys.map((key) => buildSigningKeyResponse(key));

      return next();
    }
  );

  router.post(
    '/sso-connectors/:id/signing-keys',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      // Create inactive by default — the staged step of a graceful rotation. Creating an active key
      // atomically deactivates the current one.
      body: z.object({ active: z.boolean().optional().default(false) }),
      response: samlSsoConnectorSigningKeyResponseGuard,
      status: [201, 404],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      const { active } = ctx.guard.body;
      await assertSamlConnector(id);

      const key = await createSigningKey({ ssoConnectorId: id, isActive: active });
      ctx.status = 201;
      ctx.body = buildSigningKeyResponse(key);

      return next();
    }
  );

  router.patch(
    '/sso-connectors/:id/signing-keys/:keyId',
    koaGuard({
      params: z.object({ id: z.string().min(1), keyId: z.string().min(1) }),
      body: SamlSsoConnectorSigningKeys.createGuard.pick({ active: true }),
      response: samlSsoConnectorSigningKeyResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { id, keyId } = ctx.guard.params;
      const { active } = ctx.guard.body;
      await assertSamlConnector(id);

      const key = await findSigningKeyBySsoConnectorIdAndId(id, keyId);

      ctx.status = 200;
      ctx.body = buildSigningKeyResponse(
        key.active === active
          ? key
          : await updateSigningKeyStatusBySsoConnectorIdAndId(id, keyId, active)
      );

      return next();
    }
  );

  router.delete(
    '/sso-connectors/:id/signing-keys/:keyId',
    koaGuard({
      params: z.object({ id: z.string().min(1), keyId: z.string().min(1) }),
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const { id, keyId } = ctx.guard.params;
      await assertSamlConnector(id);

      const key = await findSigningKeyBySsoConnectorIdAndId(id, keyId);

      // The active key cannot be deleted — deletion is irreversible (unlike deactivation) and its
      // certificate may be what the IdP currently trusts. Activate another key or disable signed
      // authentication requests first. The scoped query re-checks `active` atomically.
      assertThat(!key.active, 'single_sign_on.can_not_delete_active_signing_key');

      await deleteInactiveSigningKeyBySsoConnectorIdAndId(id, keyId);
      ctx.status = 204;

      return next();
    }
  );
}
