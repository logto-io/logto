import { UserScope } from '@logto/core-kit';
import { object, string, nativeEnum } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { AuthedRouter, RouterInitArgs } from '../types.js';

export default function applicationUserConsentScopeRoutes<T extends AuthedRouter>(
  ...[
    router,
    {
      libraries: {
        applications: {
          validateThirdPartyApplicationById,
          validateApplicationUserConsentScopes,
          assignApplicationUserConsentScopes,
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
}
