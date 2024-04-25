import { OrganizationScopes } from '@logto/schemas';

import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationScopeRoutes<T extends ManagementApiRouter>(
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
    middlewares: [koaQuotaGuard({ key: 'organizationsEnabled', quota, methods: ['POST', 'PUT'] })],
    errorHandler,
    searchFields: ['name'],
  });

  originalRouter.use(router.routes());
}
