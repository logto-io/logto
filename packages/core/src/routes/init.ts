import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';

import koaAuth from '@/middleware/koa-auth';
import koaLogSession from '@/middleware/koa-log-session';
import applicationRoutes from '@/routes/application';
import connectorRoutes from '@/routes/connector';
import dashboardRoutes from '@/routes/dashboard';
import resourceRoutes from '@/routes/resource';
import sessionRoutes from '@/routes/session';
import settingRoutes from '@/routes/setting';
import signInExperiencesRoutes from '@/routes/sign-in-experience';
import signInSettingsRoutes from '@/routes/sign-in-settings';
import statusRoutes from '@/routes/status';
import swaggerRoutes from '@/routes/swagger';

import adminUserRoutes from './admin-user';
import logRoutes from './log';
import roleRoutes from './role';
import { AnonymousRouter, AuthedRouter } from './types';

const createRouters = (provider: Provider) => {
  const sessionRouter: AnonymousRouter = new Router();
  sessionRouter.use(koaLogSession(provider));
  sessionRoutes(sessionRouter, provider);

  const anonymousRouter: AnonymousRouter = new Router();
  signInSettingsRoutes(anonymousRouter);
  statusRoutes(anonymousRouter);
  swaggerRoutes(anonymousRouter);

  const authedRouter: AuthedRouter = new Router();
  authedRouter.use(koaAuth());
  applicationRoutes(authedRouter);
  settingRoutes(authedRouter);
  connectorRoutes(authedRouter);
  resourceRoutes(authedRouter);
  signInExperiencesRoutes(authedRouter);
  adminUserRoutes(authedRouter);
  logRoutes(authedRouter);
  roleRoutes(authedRouter);
  dashboardRoutes(authedRouter);

  return [sessionRouter, anonymousRouter, authedRouter];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
