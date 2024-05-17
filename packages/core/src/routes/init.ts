import { getManagementApiResourceIndicator } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import koaCors from '#src/middleware/koa-cors.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import koaTenantGuard from '#src/middleware/koa-tenant-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import koaAuth from '../middleware/koa-auth/index.js';

import adminUserRoutes from './admin-user/index.js';
import applicationProtectedAppMetadataRoutes from './applications/application-protected-app-metadata.js';
import applicationRoleRoutes from './applications/application-role.js';
import applicationSignInExperienceRoutes from './applications/application-sign-in-experience.js';
import applicationUserConsentOrganizationRoutes from './applications/application-user-consent-organization.js';
import applicationUserConsentScopeRoutes from './applications/application-user-consent-scope.js';
import applicationRoutes from './applications/application.js';
import authnRoutes from './authn.js';
import connectorRoutes from './connector/index.js';
import customPhraseRoutes from './custom-phrase.js';
import dashboardRoutes from './dashboard.js';
import domainRoutes from './domain.js';
import hookRoutes from './hook.js';
import interactionRoutes from './interaction/index.js';
import logRoutes from './log.js';
import logtoConfigRoutes from './logto-config/index.js';
import organizationRoutes from './organization/index.js';
import resourceRoutes from './resource.js';
import resourceScopeRoutes from './resource.scope.js';
import roleRoutes from './role.js';
import roleScopeRoutes from './role.scope.js';
import signInExperiencesRoutes from './sign-in-experience/index.js';
import ssoConnectors from './sso-connector/index.js';
import statusRoutes from './status.js';
import swaggerRoutes from './swagger/index.js';
import systemRoutes from './system.js';
import type { AnonymousRouter, ManagementApiRouter } from './types.js';
import userAssetsRoutes from './user-assets.js';
import verificationCodeRoutes from './verification-code.js';
import wellKnownRoutes from './well-known.js';

const createRouters = (tenant: TenantContext) => {
  const interactionRouter: AnonymousRouter = new Router();
  interactionRoutes(interactionRouter, tenant);

  const managementRouter: ManagementApiRouter = new Router();
  managementRouter.use(koaAuth(tenant.envSet, getManagementApiResourceIndicator(tenant.id)));
  managementRouter.use(koaTenantGuard(tenant.id, tenant.queries));
  managementRouter.use(koaManagementApiHooks(tenant.libraries.hooks));

  applicationRoutes(managementRouter, tenant);
  applicationRoleRoutes(managementRouter, tenant);

  // Third-party application related routes
  applicationUserConsentScopeRoutes(managementRouter, tenant);
  applicationSignInExperienceRoutes(managementRouter, tenant);
  applicationUserConsentOrganizationRoutes(managementRouter, tenant);

  applicationProtectedAppMetadataRoutes(managementRouter, tenant);

  logtoConfigRoutes(managementRouter, tenant);
  connectorRoutes(managementRouter, tenant);
  resourceRoutes(managementRouter, tenant);
  resourceScopeRoutes(managementRouter, tenant);
  signInExperiencesRoutes(managementRouter, tenant);
  adminUserRoutes(managementRouter, tenant);
  logRoutes(managementRouter, tenant);
  roleRoutes(managementRouter, tenant);
  roleScopeRoutes(managementRouter, tenant);
  dashboardRoutes(managementRouter, tenant);
  customPhraseRoutes(managementRouter, tenant);
  hookRoutes(managementRouter, tenant);
  verificationCodeRoutes(managementRouter, tenant);
  userAssetsRoutes(managementRouter, tenant);
  domainRoutes(managementRouter, tenant);
  organizationRoutes(managementRouter, tenant);
  ssoConnectors(managementRouter, tenant);
  systemRoutes(managementRouter, tenant);

  const anonymousRouter: AnonymousRouter = new Router();
  wellKnownRoutes(anonymousRouter, tenant);
  statusRoutes(anonymousRouter, tenant);
  authnRoutes(anonymousRouter, tenant);
  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [interactionRouter, managementRouter, anonymousRouter]);

  return [interactionRouter, managementRouter, anonymousRouter];
};

export default function initApis(tenant: TenantContext): Koa {
  const apisApp = new Koa();

  const { adminUrlSet, cloudUrlSet } = EnvSet.values;
  apisApp.use(koaCors(adminUrlSet, cloudUrlSet));
  apisApp.use(koaBodyEtag());

  for (const router of createRouters(tenant)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  return apisApp;
}
