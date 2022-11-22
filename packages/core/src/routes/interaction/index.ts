import type { Provider } from 'oidc-provider';

import type { AnonymousRouter } from '../types.js';
import koaInteractionBodyGuard from './middleware/koa-interaction-body-guard.js';

export default function interactionRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.put('/interaction', koaInteractionBodyGuard(), async (ctx, next) => {
    // Check interaction session
    const details = await provider.interactionDetails(ctx.req, ctx.res);

    return next();
  });
}
