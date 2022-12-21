import type { ConnectorSession } from '@logto/connector-kit';
import type { LogtoErrorCode } from '@logto/phrases';
import { Event, eventGuard, identifierPayloadGuard, profileGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import type { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import { assignConnectorSessionResult } from '#src/routes/session/utils.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import submitInteraction from './actions/submit-interaction.js';
import { sendPasscodePayloadGuard, socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import {
  getInteractionStorage,
  storeInteractionResult,
  mergeIdentifiers,
} from './utils/interaction.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import {
  getSignInExperience,
  verifySignInModeSettings,
  verifyIdentifierSettings,
  verifyProfileSettings,
} from './utils/sign-in-experience-validation.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import {
  verifyIdentifierPayload,
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

  // Create a new interaction
  router.put(
    interactionPrefix,
    koaGuard({
      body: z.object({
        event: eventGuard,
        identifier: identifierPayloadGuard.optional(),
        profile: profileGuard.optional(),
      }),
    }),
    async (ctx, next) => {
      const { event, identifier, profile } = ctx.guard.body;
      const experience = await getSignInExperience(ctx, provider);

      verifySignInModeSettings(event, experience);

      if (identifier) {
        verifyIdentifierSettings(identifier, experience);
      }

      if (profile) {
        verifyProfileSettings(profile, experience);
      }

      const verifiedIdentifier = identifier && [
        await verifyIdentifierPayload(ctx, provider, identifier, {
          event,
        }),
      ];

      await storeInteractionResult(
        { event, identifiers: verifiedIdentifier, profile },
        ctx,
        provider
      );

      ctx.status = 204;

      return next();
    }
  );

  // Delete Interaction
  router.delete(interactionPrefix, async (ctx, next) => {
    await provider.interactionDetails(ctx.req, ctx.res);
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });

  // Update Interaction Event
  router.put(
    `${interactionPrefix}/event`,
    koaGuard({ body: z.object({ event: eventGuard }) }),
    async (ctx, next) => {
      const { event } = ctx.guard.body;
      verifySignInModeSettings(event, await getSignInExperience(ctx, provider));

      const interactionStorage = await getInteractionStorage(ctx, provider);

      // Forgot Password specific event interaction storage can't be shared with other types of interactions
      assertThat(
        event === Event.ForgotPassword
          ? interactionStorage.event === Event.ForgotPassword
          : interactionStorage.event !== Event.ForgotPassword,
        new RequestError({ code: 'session.verification_session_not_found', status: 404 })
      );

      await storeInteractionResult({ event }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );

  // Update Interaction Identifier
  router.patch(
    `${interactionPrefix}/identifiers`,
    koaGuard({
      body: identifierPayloadGuard,
    }),
    async (ctx, next) => {
      const identifierPayload = ctx.guard.body;
      verifyIdentifierSettings(identifierPayload, await getSignInExperience(ctx, provider));

      const interactionStorage = await getInteractionStorage(ctx, provider);

      const verifiedIdentifier = await verifyIdentifierPayload(
        ctx,
        provider,
        identifierPayload,
        interactionStorage
      );

      const identifiers = mergeIdentifiers(verifiedIdentifier, interactionStorage.identifiers);

      await storeInteractionResult({ identifiers }, ctx, provider, true);

      ctx.status = 204;

      return next();
    }
  );

  // Update Interaction Profile
  router.patch(
    `${interactionPrefix}/profile`,
    koaGuard({
      body: profileGuard,
    }),
    async (ctx, next) => {
      const profilePayload = ctx.guard.body;
      verifyProfileSettings(profilePayload, await getSignInExperience(ctx, provider));

      const interactionStorage = await getInteractionStorage(ctx, provider);

      await storeInteractionResult(
        {
          profile: {
            ...interactionStorage.profile,
            ...profilePayload,
          },
        },
        ctx,
        provider,
        true
      );

      ctx.status = 204;

      return next();
    }
  );

  // Delete Interaction Profile
  router.delete(`${interactionPrefix}/profile`, async (ctx, next) => {
    const interactionStorage = await getInteractionStorage(ctx, provider);
    const { profile, ...rest } = interactionStorage;
    await storeInteractionResult(rest, ctx, provider);

    ctx.status = 204;

    return next();
  });

  // Submit Interaction
  router.post(`${interactionPrefix}/submit`, async (ctx, next) => {
    const interactionStorage = await getInteractionStorage(ctx, provider);

    const { event } = interactionStorage;

    const accountVerifiedInteraction = await verifyIdentifier(ctx, provider, interactionStorage);

    const verifiedInteraction = await verifyProfile(accountVerifiedInteraction);

    if (event !== Event.ForgotPassword) {
      await validateMandatoryUserProfile(ctx, provider, verifiedInteraction);
    }

    await submitInteraction(verifiedInteraction, ctx, provider);

    return next();
  });

  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}${verificationPrefix}/social-authorization-uri`,
    koaGuard({ body: socialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction exists
      await getInteractionStorage(ctx, provider);

      const redirectTo = await createSocialAuthorizationUrl(
        ctx.guard.body,
        async (connectorStorage: ConnectorSession) =>
          assignConnectorSessionResult(ctx, provider, connectorStorage)
      );

      ctx.body = { redirectTo };

      return next();
    }
  );

  // Create passwordless interaction passcode
  router.post(
    `${interactionPrefix}${verificationPrefix}/passcode`,
    koaGuard({
      body: sendPasscodePayloadGuard,
    }),
    async (ctx, next) => {
      // Check interaction exists
      await getInteractionStorage(ctx, provider);

      const { jti } = await provider.interactionDetails(ctx.req, ctx.res);
      await sendPasscodeToIdentifier(ctx.guard.body, jti, ctx.createLog);

      ctx.status = 204;

      return next();
    }
  );
}
