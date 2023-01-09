import type { Resource, ResourceResponse } from '@logto/schemas';

import { findScopesByResourceIds } from '#src/queries/scope.js';

export const attachScopesToResources = async (
  resources: readonly Resource[]
): Promise<ResourceResponse[]> => {
  const resourceIds = resources.map(({ id }) => id);
  const scopes = await findScopesByResourceIds(resourceIds);

  return resources.map((resource) => ({
    ...resource,
    scopes: scopes.filter(({ resourceId }) => resourceId === resource.id),
  }));
};
