import { UserRole } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import type TenantContext from '#src/tenants/TenantContext.js';

import koaAuth from '../middleware/koa-auth.js';
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
import resourceRoutes from './resource.js';
import roleRoutes from './role.js';
import settingRoutes from './setting.js';
import signInExperiencesRoutes from './sign-in-experience/index.js';
import statusRoutes from './status.js';
import swaggerRoutes from './swagger.js';
import type { AnonymousRouter, AuthedRouter } from './types.js';
import verificationCodeRoutes from './verification-code.js';
import wellKnownRoutes from './well-known.js';

const createRouters = (tenant: TenantContext) => {
  const interactionRouter: AnonymousRouter = new Router();
  interactionRoutes(interactionRouter, tenant);

  const managementRouter: AuthedRouter = new Router();
  managementRouter.use(koaAuth(tenant.envSet, UserRole.Admin));
  applicationRoutes(managementRouter, tenant);
  settingRoutes(managementRouter, tenant);
  connectorRoutes(managementRouter, tenant);
  resourceRoutes(managementRouter, tenant);
  signInExperiencesRoutes(managementRouter, tenant);
  adminUserRoutes(managementRouter, tenant);
  adminUserRoleRoutes(managementRouter, tenant);
  logRoutes(managementRouter, tenant);
  roleRoutes(managementRouter, tenant);
  dashboardRoutes(managementRouter, tenant);
  customPhraseRoutes(managementRouter, tenant);
  hookRoutes(managementRouter, tenant);
  verificationCodeRoutes(managementRouter, tenant);

  const anonymousRouter: AnonymousRouter = new Router();
  phraseRoutes(anonymousRouter, tenant);
  wellKnownRoutes(anonymousRouter, tenant);
  statusRoutes(anonymousRouter, tenant);
  authnRoutes(anonymousRouter, tenant);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [interactionRouter, managementRouter, anonymousRouter]);

  return [interactionRouter, managementRouter, anonymousRouter];
};

export default function initRouter(tenant: TenantContext): Koa {
  const apisApp = new Koa();

  for (const router of createRouters(tenant)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  return apisApp;
}
