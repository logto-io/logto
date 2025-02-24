import { OrganizationScopes } from '@logto/schemas';

import SchemaRouter from '#src/utils/SchemaRouter.js';

import { errorHandler } from '../organization/utils.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function organizationScopeRoutes<T extends ManagementApiRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { scopes },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, scopes, {
    middlewares: [],
    errorHandler,
    searchFields: ['name'],
    isPaginationOptional: true,
  });

  originalRouter.use(router.routes());
}
