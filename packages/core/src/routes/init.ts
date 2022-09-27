import { UserRole } from '@logto/schemas';
import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import { Provider } from 'oidc-provider';

import koaAuth from '@/middleware/koa-auth';
import koaLogSession from '@/middleware/koa-log-session';
import adminUserRoutes from '@/routes/admin-user';
import applicationRoutes from '@/routes/application';
import authnRoutes from '@/routes/authn';
import connectorRoutes from '@/routes/connector';
import customPhraseRoutes from '@/routes/custom-phrase';
import dashboardRoutes from '@/routes/dashboard';
import logRoutes from '@/routes/log';
import phraseRoutes from '@/routes/phrase';
import resourceRoutes from '@/routes/resource';
import roleRoutes from '@/routes/role';
import sessionRoutes from '@/routes/session';
import settingRoutes from '@/routes/setting';
import signInExperiencesRoutes from '@/routes/sign-in-experience';
import statusRoutes from '@/routes/status';
import swaggerRoutes from '@/routes/swagger';
import wellKnownRoutes from '@/routes/well-known';

import { AnonymousRouter, AuthedRouter } from './types';

const createRouters = (provider: Provider) => {
  const sessionRouter: AnonymousRouter = new Router();
  sessionRouter.use(koaLogSession(provider));
  sessionRoutes(sessionRouter, provider);

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
  customPhraseRoutes(managementRouter);

  const anonymousRouter: AnonymousRouter = new Router();
  phraseRoutes(anonymousRouter, provider);
  wellKnownRoutes(anonymousRouter, provider);
  statusRoutes(anonymousRouter);
  authnRoutes(anonymousRouter);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [sessionRouter, managementRouter, anonymousRouter]);

  return [sessionRouter, managementRouter, anonymousRouter];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
