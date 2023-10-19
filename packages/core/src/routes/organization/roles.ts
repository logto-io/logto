import { OrganizationRoles } from '@logto/schemas';

import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationRoleRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: {
          roles,
          relations: { rolesScopes },
        },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationRoles, roles, {
    errorHandler,
  });

  router.addRelationRoutes(rolesScopes, 'scopes');

  originalRouter.use(router.routes());
}
