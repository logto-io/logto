import { OrganizationScopes } from '@logto/schemas';

import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

export default function organizationScopeRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: { organizationScopes },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, new SchemaActions(organizationScopes));

  originalRouter.use(router.routes());
}
