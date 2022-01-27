import { AnonymousRouter } from './types';

export default function statusRoutes<T extends AnonymousRouter>(router: T) {
  router.get('/status', async (ctx, next) => {
    ctx.status = 204;

    return next();
  });
}
