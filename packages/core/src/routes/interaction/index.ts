import type { LogtoErrorCode } from '@logto/phrases';
import { InteractionEvent, eventGuard, identifierPayloadGuard, profileGuard } from '@logto/schemas';
import type Router from 'koa-router';
import type { Provider } from 'oidc-provider';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import submitInteraction from './actions/submit-interaction.js';
import koaInteractionDetails from './middleware/koa-interaction-details.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionHooks from './middleware/koa-interaction-hooks.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import { sendPasscodePayloadGuard, socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import {
  getInteractionStorage,
  storeInteractionResult,
  mergeIdentifiers,
} from './utils/interaction.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import {
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
export const verificationPath = 'verification';

type RouterContext<T> = T extends Router<unknown, infer Context> ? Context : never;

export default function interactionRoutes<T extends AnonymousRouter>(
  anonymousRouter: T,
  provider: Provider
) {
  const router =
    // @ts-expect-error for good koa types
    // eslint-disable-next-line no-restricted-syntax
    (anonymousRouter as Router<unknown, WithInteractionDetailsContext<RouterContext<T>>>).use(
      koaAuditLog(),
      koaInteractionDetails(provider)
    );

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
    koaInteractionSie(),
    async (ctx, next) => {
      const { event, identifier, profile } = ctx.guard.body;
      const { signInExperience } = ctx;

      verifySignInModeSettings(event, signInExperience);

      if (identifier) {
        verifyIdentifierSettings(identifier, signInExperience);
      }

      if (profile) {
        verifyProfileSettings(profile, signInExperience);
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
    const error: LogtoErrorCode = 'oidc.aborted';
    await assignInteractionResults(ctx, provider, { error });

    return next();
  });

  // Update Interaction Event
  router.put(
    `${interactionPrefix}/event`,
    koaGuard({ body: z.object({ event: eventGuard }) }),
    koaInteractionSie(),
    async (ctx, next) => {
      const { event } = ctx.guard.body;
      const { signInExperience, interactionDetails } = ctx;

      verifySignInModeSettings(event, signInExperience);

      const interactionStorage = getInteractionStorage(interactionDetails.result);

      // Forgot Password specific event interaction storage can't be shared with other types of interactions
      assertThat(
        event === InteractionEvent.ForgotPassword
          ? interactionStorage.event === InteractionEvent.ForgotPassword
          : interactionStorage.event !== InteractionEvent.ForgotPassword,
        new RequestError({ code: 'session.interaction_not_found', status: 404 })
      );

      if (event !== interactionStorage.event) {
        await storeInteractionResult({ event }, ctx, provider, true);
      }

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
    koaInteractionSie(),
    async (ctx, next) => {
      const identifierPayload = ctx.guard.body;
      const { signInExperience, interactionDetails } = ctx;
      verifyIdentifierSettings(identifierPayload, signInExperience);

      const interactionStorage = getInteractionStorage(interactionDetails.result);

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

  // Replace Interaction Profile
  router.put(
    `${interactionPrefix}/profile`,
    koaGuard({
      body: profileGuard,
    }),
    koaInteractionSie(),
    async (ctx, next) => {
      const profilePayload = ctx.guard.body;

      const { signInExperience, interactionDetails } = ctx;
      verifyProfileSettings(profilePayload, signInExperience);

      // Check interaction exists
      getInteractionStorage(interactionDetails.result);

      await storeInteractionResult(
        {
          profile: profilePayload,
        },
        ctx,
        provider,
        true
      );

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
    koaInteractionSie(),
    async (ctx, next) => {
      const profilePayload = ctx.guard.body;
      const { signInExperience, interactionDetails } = ctx;
      verifyProfileSettings(profilePayload, signInExperience);

      const interactionStorage = getInteractionStorage(interactionDetails.result);

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
    const { interactionDetails } = ctx;
    const interactionStorage = getInteractionStorage(interactionDetails.result);
    const { profile, ...rest } = interactionStorage;
    await storeInteractionResult(rest, ctx, provider);

    ctx.status = 204;

    return next();
  });

  // Submit Interaction
  router.post(
    `${interactionPrefix}/submit`,
    koaInteractionSie(),
    koaInteractionHooks(provider),
    async (ctx, next) => {
      const { interactionDetails } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);
      const { event } = interactionStorage;

      const accountVerifiedInteraction = await verifyIdentifier(ctx, provider, interactionStorage);

      const verifiedInteraction = await verifyProfile(accountVerifiedInteraction);

      if (event !== InteractionEvent.ForgotPassword) {
        await validateMandatoryUserProfile(ctx, verifiedInteraction);
      }

      await submitInteraction(verifiedInteraction, ctx, provider);

      return next();
    }
  );

  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/social-authorization-uri`,
    koaGuard({ body: socialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction exists
      getInteractionStorage(ctx.interactionDetails.result);

      const { body: payload } = ctx.guard;

      const redirectTo = await createSocialAuthorizationUrl(ctx, provider, payload);

      ctx.body = { redirectTo };

      return next();
    }
  );

  // Create passwordless interaction passcode
  router.post(
    `${interactionPrefix}/${verificationPath}/passcode`,
    koaGuard({
      body: sendPasscodePayloadGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      await sendPasscodeToIdentifier({ event, ...guard.body }, interactionDetails.jti, createLog);

      ctx.status = 204;

      return next();
    }
  );
}
