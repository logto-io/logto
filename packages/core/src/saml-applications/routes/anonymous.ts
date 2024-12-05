import { tryThat } from '@silverhand/essentials';
import * as saml from 'samlify';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type { AnonymousRouter, RouterInitArgs } from '#src/routes/types.js';
import { fetchOidcConfig, getUserInfo } from '#src/sso/OidcConnector/utils.js';
import { SsoConnectorError } from '#src/sso/types/error.js';
import assertThat from '#src/utils/assert-that.js';

import { samlLogInResponseTemplate } from '../libraries/consts.js';

import { exchangeAuthorizationCode, generateAutoSubmitForm, createSamlResponse } from './utils.js';

const samlApplicationSignInCallbackQueryParametersGuard = z.union([
  z.object({
    code: z.string(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
  }),
]);

export default function samlApplicationAnonymousRoutes<T extends AnonymousRouter>(
  ...[router, { libraries, queries, envSet }]: RouterInitArgs<T>
) {
  const {
    samlApplications: { getSamlIdPMetadataByApplicationId },
  } = libraries;

  router.get(
    '/saml-applications/:id/metadata',
    koaGuard({
      params: z.object({ id: z.string() }),
      status: [200, 404],
      response: z.string(),
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const { metadata } = await getSamlIdPMetadataByApplicationId(id);

      ctx.status = 200;
      ctx.body = metadata;
      ctx.type = 'text/xml;charset=utf-8';

      return next();
    }
  );

  router.get(
    '/saml-applications/:id/callback',
    koaGuard({
      params: z.object({ id: z.string() }),
      query: samlApplicationSignInCallbackQueryParametersGuard,
      status: [200, 400],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        query,
      } = ctx.guard;

      // Find the SAML application secret by application ID
      const { applications, samlApplicationSecrets, samlApplicationConfigs } = queries;
      const {
        secret,
        oidcClientMetadata: { redirectUris },
      } = await applications.findApplicationById(id);

      if ('error' in query) {
        throw new RequestError({
          code: 'oidc.invalid_request',
          message: query.error_description,
        });
      }

      // TODO: need to validate state for SP initiated SAML flow
      const { code } = query;

      const { tokenEndpoint, userinfoEndpoint } = await tryThat(
        async () => fetchOidcConfig(envSet.oidc.issuer),
        (error) => {
          if (error instanceof SsoConnectorError) {
            throw new RequestError({
              code: 'oidc.invalid_request',
              message: error.message,
            });
          }

          // Should rarely happen, fetch OIDC configuration should only throw SSO connector error .
          throw error;
        }
      );

      // Exchange authorization code for tokens
      const { accessToken } = await exchangeAuthorizationCode(tokenEndpoint, {
        code,
        clientId: id,
        clientSecret: secret,
        redirectUri: redirectUris[0],
      });

      assertThat(accessToken, new RequestError('oidc.access_denied'));

      // Get user info using access token
      const userInfo = await getUserInfo(accessToken, userinfoEndpoint);

      // Get SAML configuration and create SAML response
      const { metadata } = await getSamlIdPMetadataByApplicationId(id);
      const { privateKey } =
        await samlApplicationSecrets.findActiveSamlApplicationSecretByApplicationId(id);
      const { entityId, acsUrl } =
        await samlApplicationConfigs.findSamlApplicationConfigByApplicationId(id);

      assertThat(entityId, 'application.saml.entity_id_required');
      assertThat(acsUrl, 'application.saml.acs_url_required');

      // eslint-disable-next-line new-cap
      const idp = saml.IdentityProvider({
        metadata,
        privateKey,
        isAssertionEncrypted: false,
        loginResponseTemplate: {
          context: samlLogInResponseTemplate,
          attributes: [
            {
              name: 'email',
              valueTag: 'email',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
              valueXsiType: 'xs:string',
            },
            {
              name: 'name',
              valueTag: 'name',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
              valueXsiType: 'xs:string',
            },
          ],
        },
      });

      // eslint-disable-next-line new-cap
      const sp = saml.ServiceProvider({
        entityID: entityId,
        assertionConsumerService: [
          {
            Binding: acsUrl.binding,
            Location: acsUrl.url,
          },
        ],
      });

      const { context, entityEndpoint } = await createSamlResponse(idp, sp, userInfo);

      // Return auto-submit form
      ctx.body = generateAutoSubmitForm(entityEndpoint, context);
      return next();
    }
  );
}
