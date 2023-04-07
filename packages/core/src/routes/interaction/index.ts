import type { LogtoErrorCode } from '@logto/phrases';
import {
  InteractionEvent,
  eventGuard,
  identifierPayloadGuard,
  profileGuard,
  requestVerificationCodePayloadGuard,
} from '@logto/schemas';
import type Router from 'koa-router';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { assignInteractionResults } from '#src/libraries/session.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter, RouterInitArgs } from '../types.js';

import submitInteraction from './actions/submit-interaction.js';
import consentRoutes from './consent.js';
import { interactionPrefix, verificationPath } from './const.js';
import koaInteractionDetails from './middleware/koa-interaction-details.js';
import type { WithInteractionDetailsContext } from './middleware/koa-interaction-details.js';
import koaInteractionHooks from './middleware/koa-interaction-hooks.js';
import koaInteractionSie from './middleware/koa-interaction-sie.js';
import { socialAuthorizationUrlPayloadGuard } from './types/guard.js';
import {
  getInteractionStorage,
  storeInteractionResult,
  mergeIdentifiers,
  isForgotPasswordInteractionResult,
} from './utils/interaction.js';
import {
  verifySignInModeSettings,
  verifyIdentifierSettings,
  verifyProfileSettings,
} from './utils/sign-in-experience-validation.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import { sendVerificationCodeToIdentifier } from './utils/verification-code-validation.js';
import {
  verifyIdentifierPayload,
  verifyIdentifier,
  verifyProfile,
  validateMandatoryUserProfile,
} from './verifications/index.js';

export type RouterContext<T> = T extends Router<unknown, infer Context> ? Context : never;

export default function interactionRoutes<T extends AnonymousRouter>(
  ...[anonymousRouter, tenant]: RouterInitArgs<T>
) {
  const { provider, queries, libraries } = tenant;
  const router =
    // @ts-expect-error for good koa types
    // eslint-disable-next-line no-restricted-syntax
    (anonymousRouter as Router<unknown, WithInteractionDetailsContext<RouterContext<T>>>).use(
      koaAuditLog(queries),
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
    koaInteractionSie(queries),
    async (ctx, next) => {
      const { event, identifier, profile } = ctx.guard.body;
      const { signInExperience, createLog } = ctx;

      const eventLog = createLog(`Interaction.${event}.Update`);
      eventLog.append({ event });

      verifySignInModeSettings(event, signInExperience);

      if (identifier && event !== InteractionEvent.ForgotPassword) {
        verifyIdentifierSettings(identifier, signInExperience);
      }

      if (profile && event !== InteractionEvent.ForgotPassword) {
        verifyProfileSettings(profile, signInExperience);
      }

      const verifiedIdentifier = identifier && [
        await verifyIdentifierPayload(ctx, tenant, identifier, {
          event,
        }),
      ];

      eventLog.append({ profile, verifiedIdentifier });

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
    koaInteractionSie(queries),
    async (ctx, next) => {
      const { event } = ctx.guard.body;
      const { signInExperience, interactionDetails, createLog } = ctx;

      const eventLog = createLog(`Interaction.${event}.Update`);
      eventLog.append({ event });

      verifySignInModeSettings(event, signInExperience);

      const interactionStorage = getInteractionStorage(interactionDetails.result);

      eventLog.append({ interactionStorage });

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
    koaInteractionSie(queries),
    async (ctx, next) => {
      const identifierPayload = ctx.guard.body;
      const { signInExperience, interactionDetails, createLog } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);

      const log = createLog(`Interaction.${interactionStorage.event}.Update`);

      if (interactionStorage.event !== InteractionEvent.ForgotPassword) {
        verifyIdentifierSettings(identifierPayload, signInExperience);
      }

      const verifiedIdentifier = await verifyIdentifierPayload(
        ctx,
        tenant,
        identifierPayload,
        interactionStorage
      );

      log.append({ identifier: verifiedIdentifier, interactionStorage });

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
    koaInteractionSie(queries),
    async (ctx, next) => {
      const profilePayload = ctx.guard.body;
      const { signInExperience, interactionDetails, createLog } = ctx;

      // Check interaction exists
      const interactionStorage = getInteractionStorage(interactionDetails.result);
      const { event } = interactionStorage;

      const profileLog = createLog(`Interaction.${event}.Profile.Create`);
      profileLog.append({ profile: profilePayload, interactionStorage });

      if (event !== InteractionEvent.ForgotPassword) {
        verifyProfileSettings(profilePayload, signInExperience);
      }

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
    koaInteractionSie(queries),
    async (ctx, next) => {
      const profilePayload = ctx.guard.body;
      const { signInExperience, interactionDetails, createLog } = ctx;

      const interactionStorage = getInteractionStorage(interactionDetails.result);

      const profileLog = createLog(`Interaction.${interactionStorage.event}.Profile.Update`);

      profileLog.append({ profile: profilePayload, interactionStorage, method: 'PATCH' });

      if (interactionStorage.event !== InteractionEvent.ForgotPassword) {
        verifyProfileSettings(profilePayload, signInExperience);
      }

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
    const { interactionDetails, createLog } = ctx;
    const interactionStorage = getInteractionStorage(interactionDetails.result);

    const log = createLog(`Interaction.${interactionStorage.event}.Profile.Delete`);
    log.append({ interactionStorage });

    const { profile, ...rest } = interactionStorage;

    await storeInteractionResult(rest, ctx, provider);

    ctx.status = 204;

    return next();
  });

  // Submit Interaction
  router.post(
    `${interactionPrefix}/submit`,
    koaInteractionSie(queries),
    koaInteractionHooks(tenant),
    async (ctx, next) => {
      const { interactionDetails, createLog } = ctx;
      const interactionStorage = getInteractionStorage(interactionDetails.result);

      const { event } = interactionStorage;

      const log = createLog(`Interaction.${event}.Submit`);
      log.append({ interaction: interactionStorage });

      const accountVerifiedInteraction = await verifyIdentifier(ctx, tenant, interactionStorage);

      const profileVerifiedInteraction = await verifyProfile(tenant, accountVerifiedInteraction);

      const interaction = isForgotPasswordInteractionResult(profileVerifiedInteraction)
        ? profileVerifiedInteraction
        : await validateMandatoryUserProfile(queries.users, ctx, profileVerifiedInteraction);

      await submitInteraction(interaction, ctx, tenant, log);

      return next();
    }
  );

  // Create social authorization url interaction verification
  router.post(
    `${interactionPrefix}/${verificationPath}/social-authorization-uri`,
    koaGuard({ body: socialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction exists
      const { event } = getInteractionStorage(ctx.interactionDetails.result);
      const log = ctx.createLog(`Interaction.${event}.Identifier.Social.Create`);

      const { body: payload } = ctx.guard;

      log.append(payload);

      const redirectTo = await createSocialAuthorizationUrl(ctx, tenant, payload);

      ctx.body = { redirectTo };

      return next();
    }
  );

  // Create passwordless interaction verification-code
  router.post(
    `${interactionPrefix}/${verificationPath}/verification-code`,
    koaGuard({
      body: requestVerificationCodePayloadGuard,
    }),
    async (ctx, next) => {
      const { interactionDetails, guard, createLog } = ctx;
      // Check interaction exists
      const { event } = getInteractionStorage(interactionDetails.result);

      await sendVerificationCodeToIdentifier(
        { event, ...guard.body },
        interactionDetails.jti,
        createLog,
        libraries.passcodes
      );

      ctx.status = 204;

      return next();
    }
  );

  consentRoutes(router, tenant);
}
