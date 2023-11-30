import assert from 'node:assert';

import type { UserClaim } from '@logto/core-kit';
import { idTokenClaims, userinfoClaims, UserScope } from '@logto/core-kit';
import { type User } from '@logto/schemas';
import { pick, type Nullable, cond } from '@silverhand/essentials';
import type { ClaimsParameterMember } from 'oidc-provider';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

const claimToUserKey: Readonly<
  Record<
    Exclude<
      UserClaim,
      | 'email_verified'
      | 'phone_number_verified'
      | 'roles'
      | 'organizations'
      | 'organization_data'
      | 'organization_roles'
    >,
    keyof User
  >
> = Object.freeze({
  name: 'name',
  picture: 'avatar',
  username: 'username',
  email: 'primaryEmail',
  phone_number: 'primaryPhone',
  custom_data: 'customData',
  identities: 'identities',
});

/**
 * Get user claims data according to the claims.
 *
 * @param user The current user.
 * @param claims The claims to be fulfilled.
 * @param userLibrary The user library of the current tenant.
 * @param organizationQueries The organization queries of the current tenant.
 * @returns A Promise that resolves to an array of fulfilled claims.
 */
export const getUserClaimsData = async (
  user: User,
  claims: UserClaim[],
  userLibrary: Libraries['users'],
  organizationQueries: Queries['organizations']
): Promise<ReadonlyArray<[UserClaim, unknown]>> => {
  const organizations = cond(
    claims.some((claim) => claim.startsWith('organization')) &&
      (await organizationQueries.relations.users.getOrganizationsByUserId(user.id))
  );

  return Promise.all(
    claims.map(async (claim) => {
      switch (claim) {
        case 'email_verified': {
          // LOG-4165: Change to proper key/function once profile fulfilling implemented
          return [claim, Boolean(user.primaryEmail)];
        }
        case 'phone_number_verified': {
          // LOG-4165: Change to proper key/function once profile fulfilling implemented
          return [claim, Boolean(user.primaryPhone)];
        }
        case 'roles': {
          const roles = await userLibrary.findUserRoles(user.id);
          return [claim, roles.map(({ name }) => name)];
        }
        case 'organizations': {
          assert(organizations, 'organizations should be defined');
          return [claim, organizations.map(({ id }) => id)];
        }
        case 'organization_roles': {
          assert(organizations, 'organizations should be defined');
          return [
            claim,
            organizations.flatMap(({ id, organizationRoles }) =>
              organizationRoles.map(({ name }) => `${id}:${name}`)
            ),
          ];
        }
        case 'organization_data': {
          assert(organizations, 'organizations should be defined');
          return [
            claim,
            organizations.map((element) => pick(element, 'id', 'name', 'description')),
          ];
        }
        default: {
          return [claim, user[claimToUserKey[claim]]];
        }
      }
    })
  );
};

/**
 * Get accepted user claims according to the context.
 *
 * @param use Where the claims will be used. Either `id_token` or `userinfo`.
 * @param scope The scope of the request. Each scope will be expanded to the corresponding claims.
 * @param _claims Claims parameter. (Ignored since [Claims Parameter](https://github.com/panva/node-oidc-provider/tree/main/docs#featuresclaimsparameter) is not enabled)
 * @param rejected Claims rejected by the user.
 * @returns An array of accepted user claims.
 */
export const getAcceptedUserClaims = (
  use: 'id_token' | 'userinfo',
  scope: string,
  _claims: Record<string, Nullable<ClaimsParameterMember>>,
  rejected: string[]
): UserClaim[] => {
  const scopes = scope.split(' ');
  const isUserinfo = use === 'userinfo';
  const allScopes = Object.values(UserScope);

  return scopes
    .flatMap((raw) => {
      const scope = allScopes.find((value) => value === raw);

      if (!scope) {
        // Ignore invalid scopes
        return [];
      }

      if (isUserinfo) {
        return [...idTokenClaims[scope], ...userinfoClaims[scope]];
      }

      return idTokenClaims[scope];
    })
    .filter((claim) => !rejected.includes(claim));
};
