import { type PasswordPolicyChecker, type UserInfo } from '@logto/core-kit';
import { type Optional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { type AnonymousInteractionResult } from '../types/index.js';

import findUserByIdentifier from './find-user-by-identifier.js';

/**
 * Fetch current user information from the interaction storage by checking `identifiers`
 * and `profile` properties.
 *
 * Data in `profile` will override data in `identifiers`, if any. Because `profile` will
 * overwrite the data in `identifiers` if this interaction is validated.
 */
const fetchUserInfo = async (
  tenant: TenantContext,
  { identifiers, profile }: Pick<AnonymousInteractionResult, 'identifiers' | 'profile'>
): Promise<UserInfo> => {
  const users = await Promise.all(
    identifiers?.map(async (identifier) => {
      switch (identifier.key) {
        case 'emailVerified': {
          return findUserByIdentifier(tenant, { email: identifier.value });
        }
        case 'phoneVerified': {
          return findUserByIdentifier(tenant, { phone: identifier.value });
        }
        case 'social': {
          return findUserByIdentifier(tenant, identifier);
        }
        case 'accountId': {
          return tenant.queries.users.findUserById(identifier.value);
        }
      }
    }) ?? []
  );

  // Use the first non-null user as the current user. Users with different account IDs
  // should not be mixed in the same interaction, and it should be validated in some other
  // places.
  const user = users.find((user) => user !== null);

  return {
    username: user?.username ?? profile?.username,
    email: user?.primaryEmail ?? profile?.email,
    phoneNumber: user?.primaryPhone ?? profile?.phone,
    name: user?.name ?? undefined,
  };
};

/**
 * Validate password against the given password policy if the password is not undefined,
 * throw a {@link RequestError} if the password is invalid; otherwise, do nothing.
 */
export const validatePassword = async (
  tenant: TenantContext,
  password: Optional<string>,
  checker: PasswordPolicyChecker,
  { identifiers, profile }: Pick<AnonymousInteractionResult, 'identifiers' | 'profile'>
) => {
  if (password === undefined) {
    return;
  }

  const issues = await checker.check(
    password,
    checker.policy.rejects.userInfo ? await fetchUserInfo(tenant, { identifiers, profile }) : {}
  );

  if (issues.length > 0) {
    throw new RequestError('password.rejected', issues);
  }
};
