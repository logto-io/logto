import koaGuard from '#src/middleware/koa-guard.js';

import type { AnonymousRouter } from './types.js';

export default function statusRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/status', koaGuard({ status: 204 }), async (ctx, next) => {
    ctx.status = 204;

    return next();
  });
}
