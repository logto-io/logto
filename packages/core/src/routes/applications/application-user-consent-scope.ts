import { UserScope } from '@logto/core-kit';
import {
  applicationUserConsentScopesResponseGuard,
  ApplicationUserConsentScopeType,
} from '@logto/schemas';
import { object, string, nativeEnum } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function applicationUserConsentScopeRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      id: tenantId,
      queries: {
        applications: { findApplicationById },
      },
      libraries: {
        applications: {
          validateThirdPartyApplicationById,
          validateApplicationUserConsentScopes,
          assignApplicationUserConsentScopes,
          getApplicationUserConsentOrganizationScopes,
          getApplicationUserConsentResourceScopes,
          getApplicationUserConsentOrganizationResourceScopes,
          getApplicationUserConsentScopes,
          deleteApplicationUserConsentScopesByTypeAndScopeId,
        },
      },
    },
  ]: RouterInitArgs<T>
) {
  router.post(
    '/applications/:applicationId/user-consent-scopes',
    koaGuard({
      params: object({
        applicationId: string(),
      }),
      body: object({
        organizationScopes: string().array().optional(),
        resourceScopes: string().array().optional(),
        organizationResourceScopes: string().array().optional(),
        userScopes: nativeEnum(UserScope).array().optional(),
      }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
        body,
      } = ctx.guard;

      // TODO @wangsijie: Remove this when feature is enabled in production
      const { organizationResourceScopes, ...rest } = body;
      const theBody = EnvSet.values.isDevFeaturesEnabled ? body : rest;

      await validateThirdPartyApplicationById(applicationId);

      await validateApplicationUserConsentScopes(theBody, tenantId);

      await assignApplicationUserConsentScopes(applicationId, theBody);

      ctx.status = 201;

      return next();
    }
  );

  router.get(
    '/applications/:applicationId/user-consent-scopes',
    koaGuard({
      params: object({
        applicationId: string(),
      }),
      response: EnvSet.values.isDevFeaturesEnabled
        ? applicationUserConsentScopesResponseGuard
        : applicationUserConsentScopesResponseGuard.omit({ organizationResourceScopes: true }),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;

      await findApplicationById(applicationId);

      // Note: The following queries will return full data schema, we rely on the response guard to filter out the fields we don't need.
      const [organizationScopes, resourceScopes, organizationResourceScopes, userScopes] =
        await Promise.all([
          getApplicationUserConsentOrganizationScopes(applicationId),
          getApplicationUserConsentResourceScopes(applicationId),
          getApplicationUserConsentOrganizationResourceScopes(applicationId),
          getApplicationUserConsentScopes(applicationId),
        ]);

      ctx.body = EnvSet.values.isDevFeaturesEnabled
        ? {
            organizationScopes,
            resourceScopes,
            organizationResourceScopes,
            userScopes,
          }
        : {
            organizationScopes,
            resourceScopes,
            userScopes,
          };

      return next();
    }
  );

  router.delete(
    '/applications/:applicationId/user-consent-scopes/:scopeType/:scopeId',
    koaGuard({
      params: object({
        applicationId: string(),
        scopeType: nativeEnum(ApplicationUserConsentScopeType),
        scopeId: string(),
      }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId, scopeType, scopeId },
      } = ctx.guard;

      // Validate application exists
      await findApplicationById(applicationId);

      await deleteApplicationUserConsentScopesByTypeAndScopeId(applicationId, scopeType, scopeId);

      ctx.status = 204;

      return next();
    }
  );
}
