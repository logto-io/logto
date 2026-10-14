import { type Resource, type ResourceResponse } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export const attachScopesToResources = async (
  resources: readonly Resource[],
  scopeQueries: Queries['scopes']
): Promise<ResourceResponse[]> => {
  const { findScopesByResourceIds } = scopeQueries;
  const resourceIds = resources.map(({ id }) => id);
  const scopes = await findScopesByResourceIds(resourceIds);
  // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- `Map.groupBy` is standard since ES2024; the rule's built-in method list predates it
  const scopesByResourceId = Map.groupBy(scopes, ({ resourceId }) => resourceId);

  return resources.map((resource) => ({
    ...resource,
    scopes: scopesByResourceId.get(resource.id) ?? [],
  }));
};
