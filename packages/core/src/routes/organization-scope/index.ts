import { OrganizationScopes } from '@logto/schemas';

import SchemaRouter from '#src/utils/SchemaRouter.js';

import { koaQuotaGuard } from '../../middleware/koa-quota-guard.js';
import { errorHandler } from '../organization/utils.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

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
    middlewares: [
      {
        middleware: koaQuotaGuard({ key: 'organizationScopesLimit', quota }),
        scope: 'native',
        method: ['post'],
        status: [403],
      },
    ],
    errorHandler,
    searchFields: ['name'],
    isPaginationOptional: true,
  });

  originalRouter.use(router.routes());
}
