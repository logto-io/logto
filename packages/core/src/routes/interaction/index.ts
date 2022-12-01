import { Event } from '@logto/schemas';
import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaSessionSignInExperienceGuard from './middleware/koa-session-sign-in-experience-guard.js';
import { sendPasscodePayloadGuard, getSocialAuthorizationUrlPayloadGuard } from './types/guard.js';
import {
  storeInteractionResult,
  mergeIdentifiers,
  getInteractionStorage,
} from './utils/interaction.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
import {
  identifierVerification,
  profileVerification,
  mandatoryUserProfileValidation,
} from './verifications/index.js';

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
      const { event } = ctx.interactionPayload;

      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const { error, verifiedIdentifiers } = await identifierVerification(ctx, provider);

      // Assign identifiers ahead before throwing exceptions
      if (verifiedIdentifiers) {
        await storeInteractionResult({ event, identifiers: verifiedIdentifiers }, ctx, provider);
      }

      if (error) {
        throw error;
      }

      const profile = await profileVerification(ctx, verifiedIdentifiers);

      await storeInteractionResult({ profile }, ctx, provider);

      if (event !== Event.ForgotPassword) {
        await mandatoryUserProfileValidation(ctx, verifiedIdentifiers, profile);
      }

      // TODO: SignIn Register & ResetPassword submit

      ctx.status = 200;

      return next();
    }
  );

  router.patch(
    identifierPrefix,
    koaInteractionBodyGuard(),
    koaSessionSignInExperienceGuard(provider),
    async (ctx, next) => {
      const { event } = ctx.interactionPayload;

      const interactionStorage = await getInteractionStorage(ctx, provider);

      // Forgot-password event session validation
      if (event === Event.ForgotPassword) {
        assertThat(
          interactionStorage.event === Event.ForgotPassword,
          new RequestError({ code: 'session.verification_session_not_found' })
        );
      }

      const { error, verifiedIdentifiers } = await identifierVerification(ctx, provider);

      const newIdentifiers = mergeIdentifiers({
        oldIdentifiers: interactionStorage.identifiers,
        newIdentifiers: verifiedIdentifiers,
      });

      // Assign identifiers ahead before throwing exceptions
      if (verifiedIdentifiers && verifiedIdentifiers.length > 0) {
        await storeInteractionResult({ event, identifiers: newIdentifiers }, ctx, provider);
      }

      if (error) {
        throw error;
      }

      const profile = await profileVerification(ctx, newIdentifiers);

      const newProfile = { ...interactionStorage.profile, ...profile };

      if (profile) {
        await storeInteractionResult({ profile: newProfile }, ctx, provider);
      }

      if (event !== Event.ForgotPassword) {
        await mandatoryUserProfileValidation(ctx, newIdentifiers, newProfile);
      }

      // TODO: SignIn Register & ResetPassword submit
      return next();
    }
  );

  router.post(
    `${verificationPrefix}/social/authorization-uri`,
    koaGuard({ body: getSocialAuthorizationUrlPayloadGuard }),
    async (ctx, next) => {
      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const redirectTo = await createSocialAuthorizationUrl(ctx.guard.body);

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
