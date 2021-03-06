import { UserRole } from '@logto/schemas';
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
import sessionPasswordlessRoutes from '@/routes/session/passwordless';
import sessionRoutes from '@/routes/session/session';
import sessionSocialRoutes from '@/routes/session/social';
import settingRoutes from '@/routes/setting';
import signInExperiencesRoutes from '@/routes/sign-in-experience';
import statusRoutes from '@/routes/status';
import swaggerRoutes from '@/routes/swagger';
import wellKnownRoutes from '@/routes/well-known';

import adminUserRoutes from './admin-user';
import logRoutes from './log';
import meRoutes from './me';
import roleRoutes from './role';
import { AnonymousRouter, AuthedRouter } from './types';

const createRouters = (provider: Provider) => {
  const sessionRouter: AnonymousRouter = new Router();
  sessionRouter.use(koaLogSession(provider));
  sessionRoutes(sessionRouter, provider);
  sessionPasswordlessRoutes(sessionRouter, provider);
  sessionSocialRoutes(sessionRouter, provider);

  const managementRouter: AuthedRouter = new Router();
  managementRouter.use(koaAuth(UserRole.Admin));
  applicationRoutes(managementRouter);
  settingRoutes(managementRouter);
  connectorRoutes(managementRouter);
  resourceRoutes(managementRouter);
  signInExperiencesRoutes(managementRouter);
  adminUserRoutes(managementRouter);
  logRoutes(managementRouter);
  roleRoutes(managementRouter);
  dashboardRoutes(managementRouter);

  const meRouter: AuthedRouter = new Router();
  meRouter.use(koaAuth());
  meRoutes(meRouter);

  const anonymousRouter: AnonymousRouter = new Router();
  wellKnownRoutes(anonymousRouter, provider);
  statusRoutes(anonymousRouter);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [sessionRouter, managementRouter, meRouter, anonymousRouter]);

  return [sessionRouter, managementRouter, meRouter, anonymousRouter];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
