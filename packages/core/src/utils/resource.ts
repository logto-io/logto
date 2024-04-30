import {
  type OrganizationRoleWithScopes,
  type Resource,
  type ResourceResponse,
} from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

/**
 * Query and attach scopes to resources.
 *
 * @param resources list of resources
 * @param scopeQueries queries
 * @param organizationRoles when provided, only the scopes that are assigned to the organization roles
 * @returns
 */
export const attachScopesToResources = async (
  resources: readonly Resource[],
  scopeQueries: Queries['scopes'],
  organizationRoles?: readonly OrganizationRoleWithScopes[]
): Promise<ResourceResponse[]> => {
  const { findScopesByResourceIds } = scopeQueries;
  const resourceIds = resources.map(({ id }) => id);
  const scopes = await findScopesByResourceIds(resourceIds);

  return resources.map((resource) => ({
    ...resource,
    scopes: scopes
      .filter(({ resourceId }) => resourceId === resource.id)
      .filter(
        ({ id }) =>
          !organizationRoles ||
          organizationRoles.some(({ resourceScopes }) =>
            resourceScopes.some((scope) => scope.id === id)
          )
      ),
  }));
};
