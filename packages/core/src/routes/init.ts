import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';

import koaAuth from '@/middleware/koa-auth';
import applicationRoutes from '@/routes/application';
import connectorRoutes from '@/routes/connector';
import resourceRoutes from '@/routes/resource';
import sessionRoutes from '@/routes/session';
import settingRoutes from '@/routes/setting';
import signInExperiencesRoutes from '@/routes/sign-in-experience';
import statusRoutes from '@/routes/status';
import swaggerRoutes from '@/routes/swagger';
import userRoutes from '@/routes/user';

import { AnonymousRouter, AuthedRouter } from './types';

const createRouters = (provider: Provider) => {
  const anonymousRouter: AnonymousRouter = new Router();

  statusRoutes(anonymousRouter);
  sessionRoutes(anonymousRouter, provider);
  userRoutes(anonymousRouter);
  swaggerRoutes(anonymousRouter);

  const router: AuthedRouter = new Router();
  router.use(koaAuth());
  applicationRoutes(router);
  settingRoutes(router);
  connectorRoutes(router);
  resourceRoutes(router);
  signInExperiencesRoutes(router);

  return [anonymousRouter, router];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
