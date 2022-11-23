import type { Provider } from 'oidc-provider';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';
import koaSessionSignInExperienceGuard from './middleware/koa-session-sign-in-experience-guard.js';

export default function interactionRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.put(
    '/interaction',
    koaInteractionBodyGuard(),
    koaSessionSignInExperienceGuard(provider),
    async (ctx, next) => {
      // Check interaction session
      await provider.interactionDetails(ctx.req, ctx.res);

      const { event } = ctx.interactionPayload;

      if (event === 'sign-in') {
        // Sign-in flow
        return next();
      }

      if (event === 'register') {
        // Register flow
        return next();
      }

      // Forgot password flow

      return next();
    }
  );
}
