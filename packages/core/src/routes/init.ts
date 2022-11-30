import { UserRole } from '@logto/schemas';
import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import type { Provider } from 'oidc-provider';

import koaAuth from '#src/middleware/koa-auth.js';
import koaLogSession from '#src/middleware/koa-log-session.js';
import adminUserRoutes from '#src/routes/admin-user.js';
import applicationRoutes from '#src/routes/application.js';
import authnRoutes from '#src/routes/authn.js';
import connectorRoutes from '#src/routes/connector.js';
import customPhraseRoutes from '#src/routes/custom-phrase.js';
import dashboardRoutes from '#src/routes/dashboard.js';
import logRoutes from '#src/routes/log.js';
import phraseRoutes from '#src/routes/phrase.js';
import resourceRoutes from '#src/routes/resource.js';
import roleRoutes from '#src/routes/role.js';
import sessionRoutes from '#src/routes/session/index.js';
import settingRoutes from '#src/routes/setting.js';
import signInExperiencesRoutes from '#src/routes/sign-in-experience.js';
import statusRoutes from '#src/routes/status.js';
import swaggerRoutes from '#src/routes/swagger.js';
import wellKnownRoutes from '#src/routes/well-known.js';

import type { AnonymousRouter, AuthedRouter } from './types.js';

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
