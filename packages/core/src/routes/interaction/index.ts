import { ConnectorType } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import { getLogtoConnectorById } from '#src/connectors/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaSessionSignInExperienceGuard from './middleware/koa-session-sign-in-experience-guard.js';
import { sendPasscodePayloadGuard, getSocialAuthorizationUrlPayloadGuard } from './types/guard.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import { identifierVerification } from './verifications/index.js';

export const identifierPrefix = '/identifier';
export const verificationPrefix = '/verification';

export default function interactionRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.put(
    identifierPrefix,
    koaInteractionBodyGuard(),
    koaSessionSignInExperienceGuard(provider),
    async (ctx, next) => {
      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      // PUT method must provides an event type
      assertThat(ctx.interactionPayload.event, new RequestError('guard.invalid_input'));

      const verifiedIdentifiers = await identifierVerification(ctx, provider);

      ctx.status = 200;

      return next();
    }
  );

  router.post(
    `${verificationPrefix}/social/authorization_uri`,
    koaGuard({ body: getSocialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const { connectorId, state, redirectUri } = ctx.guard.body;
      assertThat(state && redirectUri, 'session.insufficient_info');

      const connector = await getLogtoConnectorById(connectorId);

      assertThat(connector.dbEntry.enabled, 'connector.not_enabled');
      assertThat(connector.type === ConnectorType.Social, 'connector.unexpected_type');

      const redirectTo = await connector.getAuthorizationUri({ state, redirectUri });

      ctx.body = { redirectTo };

      return next();
    }
  );

  router.post(
    `${verificationPrefix}/passcode`,
    koaGuard({
      body: sendPasscodePayloadGuard,
    }),
    async (ctx, next) => {
      // Check interaction session
      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      await sendPasscodeToIdentifier(ctx.guard.body, jti, ctx.log);

      ctx.status = 204;

      return next();
    }
  );
}
