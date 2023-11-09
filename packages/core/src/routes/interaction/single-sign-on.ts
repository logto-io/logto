import { InteractionEvent } from '@logto/schemas';
import type Router from 'koa-router';
import { type IRouterParamContext } from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import assertThat from '#src/utils/assert-that.js';

import { interactionPrefix, ssoPath } from './const.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionHooks from './middleware/koa-interaction-hooks.js';
import { getInteractionStorage, storeInteractionResult } from './utils/interaction.js';
import {
  oidcAuthorizationUrlPayloadGuard,
  getSsoAuthorizationUrl,
  getSsoAuthentication,
  handleSsoAuthentication,
} from './utils/single-sign-on.js';

export default function singleSignOnRoutes<T extends IRouterParamContext>(
  router: Router<unknown, WithInteractionDetailsContext<WithLogContext<T>>>,
  tenant: TenantContext
) {
  const { provider, libraries } = tenant;

  const { ssoConnectors: ssoConnectorsLibrary } = libraries;

  // Create SSO authorization url for user interaction
  router.post(
    `${interactionPrefix}/${ssoPath}/:connectorId/authorization-url`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      // Only required for OIDC
      body: oidcAuthorizationUrlPayloadGuard.optional(),
      status: [200, 500, 404],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    async (ctx, next) => {
      const { guard, createLog } = ctx;

      const {
        params: { connectorId },
        body: payload,
      } = guard;

      /* 
        Create a new sign-in interaction directly. 
        Unlike our existing interaction APIs, to simplify the call stack, client side does not need to call the PUT interaction API ahead.
        This step is necessary for our interaction hooks to work. As it reads the event from the interaction storage.
       */
      createLog(`Interaction.SignIn.Update`);
      await storeInteractionResult({ event: InteractionEvent.SignIn }, ctx, provider);

      // Will throw 404 if connector not found, or not supported
      const connectorData = await ssoConnectorsLibrary.getSsoConnectorById(connectorId);

      const redirectTo = await getSsoAuthorizationUrl(ctx, tenant, connectorData, payload);
      ctx.body = { redirectTo };

      return next();
    }
  );

  // Verify the user's single sign on identity and sign in the user
  router.post(
    `${interactionPrefix}/${ssoPath}/:connectorId/authentication`,
    koaGuard({
      params: z.object({
        connectorId: z.string(),
      }),
      body: z.record(z.unknown()),
      status: [200, 404],
      response: z.object({
        redirectTo: z.string(),
      }),
    }),
    koaInteractionHooks(libraries),
    async (ctx, next) => {
      const { guard, interactionDetails, assignInteractionHookResult } = ctx;

      // Check SSO interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);
      assertThat(event === InteractionEvent.SignIn, 'session.connector_session_not_found');

      const {
        params: { connectorId },
        body: data,
      } = guard;

      // Will throw 404 if connector not found, or not supported
      const connectorData = await ssoConnectorsLibrary.getSsoConnectorById(connectorId);

      // Get authenticated from the SSO provider
      const ssoAuthentication = await getSsoAuthentication(ctx, tenant, connectorData, data);

      // Handle SSO authentication: sign-in or register the user
      const accountId = await handleSsoAuthentication(
        ctx,
        tenant,
        connectorData,
        ssoAuthentication
      );

      await assignInteractionResults(ctx, provider, { login: { accountId } });
      assignInteractionHookResult({ userId: accountId });

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
      response: z.string().array(),
    }),
    async (ctx, next) => {
      const { email } = ctx.guard.query;
      const connectors = await ssoConnectorsLibrary.getAvailableSsoConnectors();

      const domain = email.split('@')[1];

      assertThat(domain, new RequestError({ code: 'guard.invalid_input', status: 400, email }));

      const availableConnectors = connectors.filter(({ domains }) => domains.includes(domain));

      ctx.body = availableConnectors.map(({ id }) => id);

      return next();
    }
  );
}
