import Koa from 'koa';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';
import sessionRoutes from '@/routes/session';
import userRoutes from '@/routes/user';
import swaggerRoutes from '@/routes/swagger';
import mount from 'koa-mount';
import koaAuth, { WithAuthContext } from '@/middleware/koa-auth';
import applicationRoutes from '@/routes/application';

const createRouters = (provider: Provider) => {
  const anonymousRouter = new Router();

  sessionRoutes(anonymousRouter, provider);
  userRoutes(anonymousRouter);
  swaggerRoutes(anonymousRouter);

  const router = new Router<unknown, WithAuthContext>();
  router.use(koaAuth());
  applicationRoutes(router);

  return [anonymousRouter, router];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
