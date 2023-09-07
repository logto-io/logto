import { type Resource, type ResourceResponse } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const attachScopesToResources = async (
  resources: readonly Resource[],
  scopeQueries: Queries['scopes']
): Promise<ResourceResponse[]> => {
  const { findScopesByResourceIds } = scopeQueries;
  const resourceIds = resources.map(({ id }) => id);
  const scopes = await findScopesByResourceIds(resourceIds);

  return resources.map((resource) => ({
    ...resource,
    scopes: scopes.filter(({ resourceId }) => resourceId === resource.id),
  }));
};
