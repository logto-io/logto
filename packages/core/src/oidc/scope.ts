import type { UserClaim } from '@logto/core-kit';
import { idTokenClaims, userinfoClaims, UserScope } from '@logto/core-kit';
import type { User } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { ClaimsParameterMember } from 'oidc-provider';

import type Libraries from '#src/tenants/Libraries.js';

const claimToUserKey: Readonly<
  Record<Exclude<UserClaim, 'email_verified' | 'phone_number_verified' | 'roles'>, keyof User>
> = Object.freeze({
  name: 'name',
  picture: 'avatar',
  username: 'username',
  email: 'primaryEmail',
  phone_number: 'primaryPhone',
  custom_data: 'customData',
  identities: 'identities',
});

export const getUserClaimData = async (
  user: User,
  claim: UserClaim,
  userLibrary: Libraries['users']
): Promise<unknown> => {
  // LOG-4165: Change to proper key/function once profile fulfilling implemented
  if (claim === 'email_verified') {
    return Boolean(user.primaryEmail);
  }

  // LOG-4165: Change to proper key/function once profile fulfilling implemented
  if (claim === 'phone_number_verified') {
    return Boolean(user.primaryPhone);
  }

  if (claim === 'roles') {
    const roles = await userLibrary.findUserRoles(user.id);
    return roles.map(({ name }) => name);
  }

  return user[claimToUserKey[claim]];
};

// Ignore `_claims` since [Claims Parameter](https://github.com/panva/node-oidc-provider/tree/main/docs#featuresclaimsparameter) is not enabled
export const getUserClaims = (
  use: string,
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
