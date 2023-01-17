import type { Scope } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';

export type ApplicationLibrary = ReturnType<typeof createApplicationLibrary>;

export const createApplicationLibrary = (queries: Queries) => {
  const {
    applicationsRoles: { findApplicationsRolesByApplicationId },
    rolesScopes: { findRolesScopesByRoleIds },
    scopes: { findScopesByIdsAndResourceId },
  } = queries;

  const findApplicationScopesForResourceId = async (
    applicationId: string,
    resourceId: string
  ): Promise<readonly Scope[]> => {
    const applicationsRoles = await findApplicationsRolesByApplicationId(applicationId);
    const rolesScopes = await findRolesScopesByRoleIds(
      applicationsRoles.map(({ roleId }) => roleId)
    );
    const scopes = await findScopesByIdsAndResourceId(
      rolesScopes.map(({ scopeId }) => scopeId),
      resourceId
    );

    return scopes;
  };

  return {
    findApplicationScopesForResourceId,
  };
};
