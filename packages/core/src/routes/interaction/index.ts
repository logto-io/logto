import type { ConnectorSession } from '@logto/connector-kit';
import type { LogtoErrorCode } from '@logto/phrases';
import { Event } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { assignConnectorSessionResult } from '#src/routes/session/utils.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import submitInteraction from './actions/submit-interaction.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaSessionSignInExperienceGuard from './middleware/koa-session-sign-in-experience-guard.js';
import { sendPasscodePayloadGuard, getSocialAuthorizationUrlPayloadGuard } from './types/guard.js';
import { getInteractionStorage } from './utils/interaction.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import {
  verifyIdentifier,
  verifyProfile,
  validateMandatoryUserProfile,
} from './verifications/index.js';

export const interactionPrefix = '/interaction';
export const verificationPrefix = '/verification';

export default function interactionRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.use(koaAuditLog(), async (ctx, next) => {
    await next();

    // Prepend interaction context to log entries
    try {
      const {
        jti,
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);
      ctx.prependAllLogEntries({
        sessionId: jti,
        applicationId: conditional(typeof client_id === 'string' && client_id),
      });
    } catch (error: unknown) {
      console.error(`Failed to get oidc provider interaction details`, error);
    }
  });

  router.put(
    interactionPrefix,
    koaInteractionBodyGuard(),
    koaSessionSignInExperienceGuard(provider),
    async (ctx, next) => {
      const { event } = ctx.interactionPayload;

      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const identifierVerifiedInteraction = await verifyIdentifier(ctx, provider);

      const interaction = await verifyProfile(ctx, provider, identifierVerifiedInteraction);

      if (event !== Event.ForgotPassword) {
        await validateMandatoryUserProfile(ctx, interaction);
      }

      await submitInteraction(interaction, ctx, provider);

      return next();
    }
  );

  router.patch(
    interactionPrefix,
    koaInteractionBodyGuard(),
    koaSessionSignInExperienceGuard(provider),
    async (ctx, next) => {
      const { event } = ctx.interactionPayload;
      const interactionStorage = await getInteractionStorage(ctx, provider);

      // Forgot Password specific event interaction can't be shared with other types of interactions
      assertThat(
        event === Event.ForgotPassword
          ? interactionStorage.event === Event.ForgotPassword
          : interactionStorage.event !== Event.ForgotPassword,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      const identifierVerifiedInteraction = await verifyIdentifier(
        ctx,
        provider,
        interactionStorage
      );

      const interaction = await verifyProfile(ctx, provider, identifierVerifiedInteraction);

      if (event !== Event.ForgotPassword) {
        await validateMandatoryUserProfile(ctx, interaction);
      }

      await submitInteraction(interaction, ctx, provider);

      return next();
    }
  );

  router.delete(interactionPrefix, async (ctx, next) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });

  router.post(
    `${verificationPrefix}/social/authorization-uri`,
    koaGuard({ body: getSocialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const redirectTo = await createSocialAuthorizationUrl(
        ctx.guard.body,
        async (connectorStorage: ConnectorSession) =>
          assignConnectorSessionResult(ctx, provider, connectorStorage)
      );

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
      await sendPasscodeToIdentifier(ctx.guard.body, jti, ctx.createLog);

      ctx.status = 204;

      return next();
    }
  );
}
