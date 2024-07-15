import { type UserInfo } from '@logto/core-kit';
import {
  SignInIdentifier,
  VerificationType,
  type InteractionIdentifier,
  type User,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import type { InteractionProfile } from '../types.js';

import { type VerificationRecord } from './verifications/index.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: InteractionIdentifier
) => {
  switch (type) {
    case SignInIdentifier.Username: {
      return userQuery.findUserByUsername(value);
    }
    case SignInIdentifier.Email: {
      return userQuery.findUserByEmail(value);
    }
    case SignInIdentifier.Phone: {
      return userQuery.findUserByPhone(value);
    }
  }
};

/**
 * @throws {RequestError} -400 if the verification record type is not supported for user creation.
 * @throws {RequestError} -400 if the verification record is not verified.
 */
export const getNewUserProfileFromVerificationRecord = async (
  verificationRecord: VerificationRecord
): Promise<InteractionProfile> => {
  switch (verificationRecord.type) {
    case VerificationType.NewPasswordIdentity:
    case VerificationType.VerificationCode: {
      return verificationRecord.toUserProfile();
    }
    case VerificationType.EnterpriseSso:
    case VerificationType.Social: {
      const identityProfile = await verificationRecord.toUserProfile();
      const syncedProfile = await verificationRecord.toSyncedProfile(true);
      return { ...identityProfile, ...syncedProfile };
    }
    default: {
      // Unsupported verification type for user creation, such as MFA verification.
      throw new RequestError({ code: 'session.verification_failed', status: 400 });
    }
  }
};

/**
 * Convert the interaction profile `socialIdentity` to `User['identities']` data format
 */
export const toUserSocialIdentityData = (
  socialIdentity: Required<InteractionProfile>['socialIdentity']
): User['identities'] => {
  const { target, userInfo } = socialIdentity;

  return {
    [target]: {
      userId: userInfo.id,
      details: userInfo,
    },
  };
};

export function interactionIdentifierToUserProfile(
  identifier: InteractionIdentifier
): { username: string } | { primaryEmail: string } | { primaryPhone: string } {
  const { type, value } = identifier;
  switch (type) {
    case SignInIdentifier.Username: {
      return { username: value };
    }
    case SignInIdentifier.Email: {
      return { primaryEmail: value };
    }
    case SignInIdentifier.Phone: {
      return { primaryPhone: value };
    }
  }
}

/**
 * This function is used to convert the interaction profile to the UserInfo format.
 * It will be used by the PasswordPolicyChecker to check the password policy against the user profile.
 */
export function profileToUserInfo(
  profile: Pick<InteractionProfile, 'name' | 'username' | 'primaryEmail' | 'primaryPhone'>
): UserInfo {
  const { name, username, primaryEmail, primaryPhone } = profile;

  return {
    name: name ?? undefined,
    username: username ?? undefined,
    email: primaryEmail ?? undefined,
    phoneNumber: primaryPhone ?? undefined,
  };
}
