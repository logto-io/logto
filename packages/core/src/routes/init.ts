import { UserRole } from '@logto/schemas';
import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import type { Provider } from 'oidc-provider';

import koaAuth from '../middleware/koa-auth.js';
import koaLogSession from '../middleware/koa-log-session.js';
import adminUserRoutes from './admin-user.js';
import applicationRoutes from './application.js';
import authnRoutes from './authn.js';
import connectorRoutes from './connector.js';
import customPhraseRoutes from './custom-phrase.js';
import dashboardRoutes from './dashboard.js';
import logRoutes from './log.js';
import phraseRoutes from './phrase.js';
import profileRoutes from './profile.js';
import resourceRoutes from './resource.js';
import roleRoutes from './role.js';
import sessionRoutes from './session/index.js';
import settingRoutes from './setting.js';
import signInExperiencesRoutes from './sign-in-experience.js';
import statusRoutes from './status.js';
import swaggerRoutes from './swagger.js';
import type { AnonymousRouter, AuthedRouter } from './types.js';
import wellKnownRoutes from './well-known.js';

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

  const profileRouter: AnonymousRouter = new Router();
  profileRoutes(profileRouter, provider);

  const anonymousRouter: AnonymousRouter = new Router();
  phraseRoutes(anonymousRouter, provider);
  wellKnownRoutes(anonymousRouter, provider);
  statusRoutes(anonymousRouter);
  authnRoutes(anonymousRouter);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [sessionRouter, profileRouter, managementRouter, anonymousRouter]);

  return [sessionRouter, profileRouter, managementRouter, anonymousRouter];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
