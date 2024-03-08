import type { JwtCustomizerUserContext } from '@logto/schemas';
import {
  userInfoSelectFields,
  OrganizationScopes,
  jwtCustomizerUserContextGuard,
} from '@logto/schemas';
import { deduplicate, pick, pickState } from '@silverhand/essentials';

import { type UserLibrary } from '#src/libraries/user.js';
import type Queries from '#src/tenants/Queries.js';

export const createJwtCustomizerLibrary = (queries: Queries, userLibrary: UserLibrary) => {
  const {
    users: { findUserById },
    rolesScopes: { findRolesScopesByRoleId },
    scopes: { findScopeById },
    resources: { findResourceById },
    userSsoIdentities,
    organizations: { relations },
  } = queries;
  const { findUserRoles } = userLibrary;

  const getUserContext = async (userId: string): Promise<JwtCustomizerUserContext> => {
    const user = await findUserById(userId);
    const fullSsoIdentities = await userSsoIdentities.findUserSsoIdentitiesByUserId(userId);
    const roles = await findUserRoles(userId);
    const organizationsWithRoles = await relations.users.getOrganizationsByUserId(userId);
    const userContext = {
      ...pick(user, ...userInfoSelectFields),
      ssoIdentities: fullSsoIdentities.map(pickState('issuer', 'identityId', 'detail')),
      mfaVerificationFactors: deduplicate(user.mfaVerifications.map(({ type }) => type)),
      roles: await Promise.all(
        roles.map(async (role) => {
          const fullRolesScopes = await findRolesScopesByRoleId(role.id);
          const scopeIds = fullRolesScopes.map(({ scopeId }) => scopeId);
          return {
            ...pick(role, 'id', 'name', 'description'),
            scopes: await Promise.all(
              scopeIds.map(async (scopeId) => {
                const scope = await findScopeById(scopeId);
                return {
                  ...pick(scope, 'id', 'name', 'description'),
                  ...(await findResourceById(scope.resourceId).then(
                    ({ indicator, id: resourceId }) => ({ indicator, resourceId })
                  )),
                };
              })
            ),
          };
        })
      ),
      // No need to deal with the type here, the type will be enforced by the guard when return the result.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      organizations: Object.fromEntries(
        await Promise.all(
          organizationsWithRoles.map(async ({ organizationRoles, ...organization }) => [
            organization.id,
            {
              roles: await Promise.all(
                organizationRoles.map(async ({ id, name }) => {
                  const [_, fullOrganizationScopes] = await relations.rolesScopes.getEntities(
                    OrganizationScopes,
                    { organizationRoleId: id }
                  );
                  return {
                    id,
                    name,
                    scopes: fullOrganizationScopes.map(pickState('id', 'name', 'description')),
                  };
                })
              ),
            },
          ])
        )
      ),
    };

    return jwtCustomizerUserContextGuard.parse(userContext);
  };

  return {
    getUserContext,
  };
};
