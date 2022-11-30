import type { Provider } from 'oidc-provider';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaSessionSignInExperienceGuard from './middleware/koa-session-sign-in-experience-guard.js';
import { sendPasscodePayloadGuard, getSocialAuthorizationUrlPayloadGuard } from './types/guard.js';
import { sendPasscodeToIdentifier } from './utils/passcode-validation.js';
import { createSocialAuthorizationUrl } from './utils/social-verification.js';
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

      const verifiedIdentifiers = await identifierVerification(ctx, provider);

      ctx.status = 200;

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
