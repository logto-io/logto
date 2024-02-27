import { isManagementApi, RoleType } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const createRoleScopeLibrary = (queries: Queries) => {
  const {
    roles: { findRoleById },
    scopes: { findScopeById },
    resources: { findResourceById },
    rolesScopes: { findRolesScopesByRoleId },
  } = queries;

  const validateRoleScopeAssignment = async (
    scopeIds: string[],
    roleId: string,
    options: { skipScopeExistenceCheck?: boolean } = {}
  ) => {
    // No need to validate if no scopes are being assigned.
    if (scopeIds.length === 0) {
      return;
    }

    const { skipScopeExistenceCheck } = options;
    const role = await findRoleById(roleId);

    // Make sure all scopes have not been assigned to the role.
    // The check can be skipped if the role is newly created.
    if (!skipScopeExistenceCheck) {
      const rolesScopes = await findRolesScopesByRoleId(roleId);

      for (const scopeId of scopeIds) {
        assertThat(
          !rolesScopes.some(({ scopeId: _scopeId }) => _scopeId === scopeId),
          new RequestError({
            code: 'role.scope_exists',
            status: 422,
            scopeId,
          })
        );
      }
    }

    await Promise.all(
      scopeIds.map(async (scopeId) => {
        // 1. Make sure the `scopeId` is valid.
        const { resourceId } = await findScopeById(scopeId);
        // 2. Make sure management API scopes can not be assigned to user roles.
        if (role.type === RoleType.User) {
          const { indicator } = await findResourceById(resourceId);
          assertThat(
            !isManagementApi(indicator),
            'role.management_api_scopes_not_assignable_to_user_role'
          );
        }
      })
    );
  };

  return {
    validateRoleScopeAssignment,
  };
};
