import { UserRole } from '@logto/schemas';
import Koa from 'koa';
import mount from 'koa-mount';
import Router from 'koa-router';
import type { Provider } from 'oidc-provider';

import koaAuditLogLegacy from '#src/middleware/koa-audit-log-legacy.js';

import koaAuth from '../middleware/koa-auth.js';
import koaLogSessionLegacy from '../middleware/koa-log-session-legacy.js';
import adminUserRoleRoutes from './admin-user-role.js';
import adminUserRoutes from './admin-user.js';
import applicationRoutes from './application.js';
import authnRoutes from './authn.js';
import connectorRoutes from './connector.js';
import customPhraseRoutes from './custom-phrase.js';
import dashboardRoutes from './dashboard.js';
import hookRoutes from './hook.js';
import interactionRoutes from './interaction/index.js';
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
import type { AnonymousRouter, AnonymousRouterLegacy, AuthedRouter } from './types.js';
import wellKnownRoutes from './well-known.js';

const createRouters = (provider: Provider) => {
  const sessionRouter: AnonymousRouterLegacy = new Router();
  sessionRouter.use(koaAuditLogLegacy(), koaLogSessionLegacy(provider));
  sessionRoutes(sessionRouter, provider);

  const interactionRouter: AnonymousRouter = new Router();
  interactionRoutes(interactionRouter, provider);

  const managementRouter: AuthedRouter = new Router();
  managementRouter.use(koaAuth(UserRole.Admin));
  applicationRoutes(managementRouter);
  settingRoutes(managementRouter);
  connectorRoutes(managementRouter);
  resourceRoutes(managementRouter);
  signInExperiencesRoutes(managementRouter);
  adminUserRoutes(managementRouter);
  adminUserRoleRoutes(managementRouter);
  logRoutes(managementRouter);
  roleRoutes(managementRouter);
  dashboardRoutes(managementRouter);
  customPhraseRoutes(managementRouter);
  hookRoutes(managementRouter);

  const profileRouter: AnonymousRouter = new Router();
  profileRoutes(profileRouter, provider);

  const anonymousRouter: AnonymousRouter = new Router();
  phraseRoutes(anonymousRouter, provider);
  wellKnownRoutes(anonymousRouter, provider);
  statusRoutes(anonymousRouter);
  authnRoutes(anonymousRouter);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [
    sessionRouter,
    interactionRouter,
    profileRouter,
    managementRouter,
    anonymousRouter,
  ]);

  return [sessionRouter, interactionRouter, profileRouter, managementRouter, anonymousRouter];
};

export default function initRouter(app: Koa, provider: Provider) {
  const apisApp = new Koa();

  for (const router of createRouters(provider)) {
    // @ts-expect-error will remove once interaction refactor finished
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  app.use(mount('/api', apisApp));
}
