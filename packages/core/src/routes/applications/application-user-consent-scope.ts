import { UserScope } from '@logto/core-kit';
import { applicationUserConsentScopesResponseGuard } from '@logto/schemas';
import { object, string, nativeEnum } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

export default function applicationUserConsentScopeRoutes<T extends AuthedRouter>(
  ...[
    router,
    {
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
          getApplicationUserConsentScopes,
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
        userScopes: nativeEnum(UserScope).array().optional(),
      }),
      status: [201, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { applicationId },
        body,
      } = ctx.guard;

      await validateThirdPartyApplicationById(applicationId);

      await validateApplicationUserConsentScopes(body);

      await assignApplicationUserConsentScopes(applicationId, body);

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
      response: applicationUserConsentScopesResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { applicationId } = ctx.guard.params;

      await findApplicationById(applicationId);

      // Note: The following queries will return full data schema, we rely on the response guard to filter out the fields we don't need.
      const [organizationScopes, resourceScopes, userScopes] = await Promise.all([
        getApplicationUserConsentOrganizationScopes(applicationId),
        getApplicationUserConsentResourceScopes(applicationId),
        getApplicationUserConsentScopes(applicationId),
      ]);

      ctx.body = {
        organizationScopes,
        resourceScopes,
        userScopes,
      };

      return next();
    }
  );
}
