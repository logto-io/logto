import koaGuard from '@/middleware/koa-guard';

import { AnonymousRouter } from './types';

export default function statusRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/status', koaGuard({ status: 204 }), async (ctx, next) => {
    ctx.status = 204;

    return next();
  });
}
