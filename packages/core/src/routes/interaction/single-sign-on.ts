import { ConnectorError, type ConnectorSession } from '@logto/connector-kit';
import { validateRedirectUrl } from '@logto/core-kit';
import { InteractionEvent } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix, ssoPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import { getInteractionStorage } from './utils/interaction.js';
import { assignConnectorSessionResult } from './utils/social-verification.js';

export default function singleSignOnRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithLogContext<T>>>,
  tenant: TenantContext
) {
  const {
    id: tenantId,
    provider,
    libraries: { ssoConnector },
  } = tenant;

  // Create SSO authorization url for user interaction
  router.post(
    `${interactionPrefix}/${ssoPath}/:connectorId/authorization-url`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      body: z.object({
        state: z.string().min(1),
        redirectUri: z.string().refine((url) => validateRedirectUrl(url, 'web')),
      }),
      status: [200, 500, 404],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog, req, res } = ctx;
      const { jti } = await provider.interactionDetails(req, res);

      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      assertThat(
        event !== InteractionEvent.ForgotPassword,
        'session.not_supported_for_forgot_password'
      );

      const log = createLog(`Interaction.${event}.Identifier.SingleSignOn.Create`);

      const {
        params: { connectorId },
      } = guard;

      const { body: payload } = guard;

      log.append({
        connectorId,
        ...payload,
      });

      const { state, redirectUri } = payload;
      assertThat(state && redirectUri, 'session.insufficient_info');

      // Will throw 404 if connector not found, or not supported
      const connectorData = await ssoConnector.getSsoConnectorById(connectorId);

      try {
        // Will throw ConnectorError if the config is invalid
        const connectorInstance = new ssoConnectorFactories[connectorData.providerName].constructor(
          connectorData,
          tenantId
        );

        // Will throw ConnectorError if failed to fetch the provider's config
        const redirectTo = await connectorInstance.getAuthorizationUrl(
          { state, redirectUri, jti },
          async (connectorSession: ConnectorSession) =>
            assignConnectorSessionResult(ctx, provider, connectorSession)
        );

        // TODO: Add SAML connector support later

        ctx.body = { redirectTo };
      } catch (error: unknown) {
        // Catch ConnectorError and re-throw as 500 RequestError
        if (error instanceof ConnectorError) {
          throw new RequestError({ code: `connector.${error.code}`, status: 500 }, error.data);
        }

        throw error;
      }

      return next();
    }
  );

  // Get the available SSO connectors for the user to choose from by a given email
  router.get(
    `${interactionPrefix}/${ssoPath}/connectors`,
    koaGuard({
      query: z.object({
        email: z.string().email(),
      }),
      status: [200, 400],
      response: z.array(
        z.object({
          id: z.string(),
          ssoOnly: z.boolean(),
        })
      ),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.query;
      const connectors = await ssoConnector.getAvailableSsoConnectors();

      const domain = email.split('@')[1];

      assertThat(domain, new RequestError({ code: 'guard.invalid_input', status: 400, email }));

      const availableConnectors = connectors.filter(({ domains }) => domains.includes(domain));

      ctx.body = availableConnectors.map(({ id, ssoOnly }) => ({ id, ssoOnly }));

      return next();
    }
  );
}
