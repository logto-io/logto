import type { Scope, ScopeResponse } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export type ScopeLibrary = ReturnType<typeof createScopeLibrary>;

export const createScopeLibrary = (queries: Queries) => {
  const {
    resources: { findResourcesByIds },
  } = queries;

  const attachResourceToScopes = async (scopes: readonly Scope[]): Promise<ScopeResponse[]> => {
    const resources = await findResourcesByIds(scopes.map(({ resourceId }) => resourceId));
    return scopes.map((scope) => {
      const resource = resources.find(({ id }) => id === scope.resourceId);

      assertThat(resource, new Error(`Cannot find resource for id ${scope.resourceId}`));

      return {
        ...scope,
        resource,
      };
    });
  };

  return {
    attachResourceToScopes,
  };
};
