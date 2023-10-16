import { OrganizationScopes } from '@logto/schemas';

import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationScopeRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { scopes },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, new SchemaActions(scopes), { errorHandler });

  originalRouter.use(router.routes());
}
