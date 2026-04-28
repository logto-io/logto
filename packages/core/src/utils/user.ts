import {
  MfaFactor,
  Users,
  userInfoSelectFields,
  userProfileResponseGuard,
  type UserProfileResponse,
  type UserSsoIdentity,
  type User,
  type UserMfaVerificationResponse,
} from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared/universal';
import { pick } from '@silverhand/essentials';
import { type z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

export const adminUserProfileResponseGuard = userProfileResponseGuard.extend({
  passwordDigest: Users.guard.shape.passwordEncrypted.optional(),
  passwordAlgorithm: Users.guard.shape.passwordEncryptionMethod.optional(),
});

type AdminUserProfileResponse = z.infer<typeof adminUserProfileResponseGuard>;

export const transpileUserMfaVerifications = (
  mfaVerifications: User['mfaVerifications']
): UserMfaVerificationResponse => {
  return mfaVerifications.map((verification) => {
    const { id, createdAt, type } = verification;

    if (type === MfaFactor.BackupCode) {
      const { codes } = verification;

      return { id, createdAt, type, remainCodes: codes.filter((code) => !code.usedAt).length };
    }

    if (type === MfaFactor.WebAuthn) {
      const { agent, name, lastUsedAt } = verification;

      return { id, createdAt, lastUsedAt, type, agent, name };
    }

    return { id, createdAt, type };
  });
};

/**
 * Transforms user data into a `UserProfileResponse`. Password hash fields are intentionally
 * excluded.
 *
 * For admin endpoints that support the `includePasswordHash` query parameter, use
 * {@link transpileAdminUserProfileResponse} instead.
 */
export const transpileUserProfileResponse = (
  user: User,
  ssoIdentities?: UserSsoIdentity[]
): UserProfileResponse => ({
  ...pick(user, ...userInfoSelectFields),
  hasPassword: Boolean(user.passwordEncrypted),
  ...(ssoIdentities && { ssoIdentities }),
});

/**
 * Transforms user data into an `AdminUserProfileResponse` for admin endpoints that support the
 * `includePasswordHash` query parameter.
 *
 * It is a superset of `UserProfileResponse` that optionally includes `passwordDigest` and
 * `passwordAlgorithm` when `includePasswordHash` is `true`.
 *
 * @param extraInfo.ssoIdentities - SSO identities to include in the response.
 * @param extraInfo.includePasswordHash - When `true`, the raw password hash and algorithm are
 * included in the response.
 */
export const transpileAdminUserProfileResponse = (
  user: User,
  extraInfo: { ssoIdentities?: UserSsoIdentity[]; includePasswordHash?: boolean } = {}
): AdminUserProfileResponse => {
  const { ssoIdentities, includePasswordHash } = extraInfo;

  return {
    ...transpileUserProfileResponse(user, ssoIdentities),
    ...(includePasswordHash && {
      passwordDigest: user.passwordEncrypted,
      passwordAlgorithm: user.passwordEncryptionMethod,
    }),
  };
};

// Not used yet, may be used in the future, keep as a individual method.
const getValidPhoneNumber = (phone: string): string => {
  if (!phone) {
    return phone;
  }

  try {
    return PhoneNumberParser.parse(phone).number;
  } catch (error) {
    throw new RequestError({ code: 'user.invalid_phone', status: 422 }, error);
  }
};

export const validatePhoneNumber = (phone: string): void => {
  getValidPhoneNumber(phone);
};

export const getUserIdentifierCount = (user: User, ssoIdentityCount = 0): number => {
  return (
    Number(Boolean(user.username)) +
    Number(Boolean(user.primaryEmail)) +
    Number(Boolean(user.primaryPhone)) +
    Object.keys(user.identities).length +
    ssoIdentityCount
  );
};

type UserIdentifierUpdate = Partial<
  Pick<User, 'username' | 'primaryEmail' | 'primaryPhone' | 'identities'>
>;

export const assertUserHasRemainingIdentifier = (
  user: User,
  identifierUpdate: UserIdentifierUpdate,
  ssoIdentityCount = 0
) => {
  assertThat(
    getUserIdentifierCount({ ...user, ...identifierUpdate }, ssoIdentityCount) > 0,
    new RequestError('user.last_sign_in_method_required')
  );
};

export const assertCanDeleteSocialIdentity = (user: User, target: string, ssoIdentityCount = 0) => {
  assertThat(
    user.identities[target],
    new RequestError({ code: 'user.identity_not_exist', status: 404 })
  );

  const { [target]: _deletedIdentity, ...identities } = user.identities;
  assertUserHasRemainingIdentifier(user, { identities }, ssoIdentityCount);
};
