import { OrganizationScopes } from '@logto/schemas';

import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationScopeRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { scopes },
      },
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, scopes, {
    errorHandler,
    searchFields: ['name'],
  });

  router.use(koaQuotaGuard({ key: 'organizationsEnabled', quota, methods: ['POST', 'PUT'] }));

  originalRouter.use(router.routes());
}
