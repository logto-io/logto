import { getManagementApiResourceIndicator } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import koaAuditLog from '#src/middleware/koa-audit-log.js';
import koaBodyEtag from '#src/middleware/koa-body-etag.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import koaTenantGuard from '#src/middleware/koa-tenant-guard.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import koaAuth from '../middleware/koa-auth/index.js';
import koaOidcAuth from '../middleware/koa-auth/koa-oidc-auth.js';
import koaCors from '../middleware/koa-cors.js';

import { accountApiPrefix } from './account/constants.js';
import accountRoutes from './account/index.js';
import accountCentersRoutes from './account-center/index.js';
import adminUserRoutes from './admin-user/index.js';
import applicationOrganizationRoutes from './applications/application-organization.js';
import applicationProtectedAppMetadataRoutes from './applications/application-protected-app-metadata.js';
import applicationRoleRoutes from './applications/application-role.js';
import applicationSecretRoutes from './applications/application-secret.js';
import applicationSignInExperienceRoutes from './applications/application-sign-in-experience.js';
import applicationUserConsentOrganizationRoutes from './applications/application-user-consent-organization.js';
import applicationUserConsentScopeRoutes from './applications/application-user-consent-scope.js';
import applicationRoutes from './applications/application.js';
import authnRoutes from './authn.js';
import captchaProviderRoutes from './captcha-provider/index.js';
import connectorRoutes from './connector/index.js';
import customPhraseRoutes from './custom-phrase.js';
import customProfileFieldsRoutes from './custom-profile-fields.js';
import dashboardRoutes from './dashboard.js';
import domainRoutes from './domain.js';
import emailTemplateRoutes from './email-template/index.js';
import experienceApiRoutes from './experience/index.js';
import hookRoutes from './hook.js';
import interactionRoutes from './interaction/index.js';
import logRoutes from './log.js';
import logtoConfigRoutes from './logto-config/index.js';
import oneTimeTokenRoutes from './one-time-tokens.js';
import organizationRoutes from './organization/index.js';
import publicWellKnownRoutes from './public-wellknown.js';
import resourceRoutes from './resource.js';
import resourceScopeRoutes from './resource.scope.js';
import roleRoutes from './role.js';
import roleScopeRoutes from './role.scope.js';
import samlApplicationAnonymousRoutes from './saml-application/anonymous.js';
import samlApplicationRoutes from './saml-application/index.js';
import secretsRoutes from './secret.js';
import sentinelActivitiesRoutes from './sentinel-activities.js';
import signInExperiencesRoutes from './sign-in-experience/index.js';
import ssoConnectors from './sso-connector/index.js';
import statusRoutes from './status.js';
import subjectTokenRoutes from './subject-token.js';
import swaggerRoutes from './swagger/index.js';
import systemRoutes from './system.js';
import type { AnonymousRouter, ManagementApiRouter, UserRouter } from './types.js';
import userAssetsRoutes from './user-assets.js';
import verificationRoutes, { verificationApiPrefix } from './verification/index.js';
import verificationCodeRoutes from './verification-code.js';
import wellKnownRoutes from './well-known/index.js';
import wellKnownOpenApiRoutes from './well-known/well-known.openapi.js';

const createRouters = (tenant: TenantContext) => {
  const interactionRouter: AnonymousRouter = new Router();
  /** @deprecated */
  interactionRoutes(interactionRouter, tenant);

  const experienceRouter: AnonymousRouter = new Router();
  experienceRouter.use(koaAuditLog(tenant.queries));
  experienceApiRoutes(experienceRouter, tenant);

  const managementRouter: ManagementApiRouter = new Router();
  managementRouter.use(koaAuth(tenant.envSet, getManagementApiResourceIndicator(tenant.id)));
  managementRouter.use(koaTenantGuard(tenant.id, tenant.queries));
  managementRouter.use(koaManagementApiHooks(tenant.libraries.hooks));

  // TODO: FIXME @sijie @darcy mount these routes in `applicationRoutes` instead
  applicationRoutes(managementRouter, tenant);
  applicationRoleRoutes(managementRouter, tenant);
  applicationProtectedAppMetadataRoutes(managementRouter, tenant);
  applicationOrganizationRoutes(managementRouter, tenant);
  applicationSecretRoutes(managementRouter, tenant);

  // Third-party application related routes
  applicationUserConsentScopeRoutes(managementRouter, tenant);
  applicationSignInExperienceRoutes(managementRouter, tenant);
  applicationUserConsentOrganizationRoutes(managementRouter, tenant);

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
  subjectTokenRoutes(managementRouter, tenant);
  accountCentersRoutes(managementRouter, tenant);
  samlApplicationRoutes(managementRouter, tenant);
  emailTemplateRoutes(managementRouter, tenant);
  oneTimeTokenRoutes(managementRouter, tenant);
  captchaProviderRoutes(managementRouter, tenant);
  sentinelActivitiesRoutes(managementRouter, tenant);
  customProfileFieldsRoutes(managementRouter, tenant);
  secretsRoutes(managementRouter, tenant);

  // General anonymous router for publicly accessible APIs
  const anonymousRouter: AnonymousRouter = new Router();

  const userRouter: UserRouter = new Router();
  userRouter.use(koaOidcAuth(tenant));
  // TODO(LOG-10147): Rename to koaApiHooks, this middleware is used for both management API and user API
  userRouter.use(koaManagementApiHooks(tenant.libraries.hooks));
  accountRoutes(userRouter, tenant);
  verificationRoutes(userRouter, tenant);

  // General anonymous APIs - publicly accessible
  wellKnownRoutes(anonymousRouter, tenant);
  statusRoutes(anonymousRouter, tenant);
  authnRoutes(anonymousRouter, tenant);
  samlApplicationAnonymousRoutes(anonymousRouter, tenant);

  wellKnownOpenApiRoutes(anonymousRouter, {
    experienceRouters: [experienceRouter, interactionRouter],
    managementRouters: [managementRouter, anonymousRouter],
    userRouters: [userRouter],
  });

  // The swagger.json should contain all API routers.
  swaggerRoutes(anonymousRouter, [
    managementRouter,
    anonymousRouter,
    experienceRouter,
    userRouter,
    // TODO: interactionRouter should be removed from swagger.json
    interactionRouter,
  ]);

  return [experienceRouter, interactionRouter, managementRouter, anonymousRouter, userRouter];
};

export default function initApis(tenant: TenantContext): Koa {
  const apisApp = new Koa();
  const { adminUrlSet, cloudUrlSet } = EnvSet.values;
  apisApp.use(koaCors([adminUrlSet, cloudUrlSet], [accountApiPrefix, verificationApiPrefix]));
  apisApp.use(koaBodyEtag());

  for (const router of createRouters(tenant)) {
    apisApp.use(router.routes()).use(router.allowedMethods());
  }

  return apisApp;
}

export function initPublicWellKnownApis(tenant: TenantContext): Koa {
  const globalApisApp = new Koa();
  const anonymousRouter: AnonymousRouter = new Router();
  publicWellKnownRoutes(anonymousRouter, tenant);
  globalApisApp.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());

  return globalApisApp;
}
