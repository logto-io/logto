import { User } from '@logto/schemas';
import { idTokenClaims, UserClaim, userinfoClaims, UserScope } from '@logto/core-kit';
import { Nullable } from '@silverhand/essentials';
import { ClaimsParameterMember } from 'oidc-provider';

export const claimToUserKey: Readonly<Record<UserClaim, keyof User>> = Object.freeze({
  name: 'name',
  picture: 'avatar',
  username: 'username',
  role_names: 'roleNames',
  email: 'primaryEmail',
  // LOG-4165: Change to proper key/function once profile fulfilling implemented
  email_verified: 'primaryEmail',
  phone_number: 'primaryPhone',
  // LOG-4165: Change to proper key/function once profile fulfilling implemented
  phone_number_verified: 'primaryPhone',
  custom_data: 'customData',
  identities: 'identities',
});

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
