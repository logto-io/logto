import { type UserInfo } from '@logto/core-kit';
import {
  SignInIdentifier,
  VerificationType,
  type InteractionIdentifier,
  type User,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

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
 * @throws {RequestError} -400 if the verification record type is not supported for user identification.
 * @throws {RequestError} -400 if the verification record is not verified.
 * @throws {RequestError} -404 if the user is not found.
 */
export const identifyUserByVerificationRecord = async (
  verificationRecord: VerificationRecord,
  linkSocialIdentity?: boolean
): Promise<{
  user: User;
  /**
   * Returns the social/enterprise SSO synced profiled if the verification record is a social/enterprise SSO verification.
   * - For new linked identity, the synced profile will includes the new social or enterprise SSO identity.
   * - For existing social or enterprise SSO identity, the synced profile will return the synced user profile based on connector settings.
   */
  syncedProfile?: Pick<
    InteractionProfile,
    'enterpriseSsoIdentity' | 'socialIdentity' | 'avatar' | 'name'
  >;
}> => {
  // Check verification record can be used to identify a user using the `identifyUser` method.
  // E.g. MFA verification record does not have the `identifyUser` method, cannot be used to identify a user.
  assertThat(
    'identifyUser' in verificationRecord,
    new RequestError({ code: 'session.verification_failed', status: 400 })
  );

  switch (verificationRecord.type) {
    case VerificationType.Password:
    case VerificationType.VerificationCode: {
      return { user: await verificationRecord.identifyUser() };
    }
    case VerificationType.Social: {
      const user = linkSocialIdentity
        ? await verificationRecord.identifyRelatedUser()
        : await verificationRecord.identifyUser();

      const syncedProfile = {
        ...(await verificationRecord.toSyncedProfile()),
        ...conditional(linkSocialIdentity && (await verificationRecord.toUserProfile())),
      };

      return { user, syncedProfile };
    }
    case VerificationType.EnterpriseSso: {
      try {
        const user = await verificationRecord.identifyUser();
        const syncedProfile = await verificationRecord.toSyncedProfile();
        return { user, syncedProfile };
      } catch (error: unknown) {
        // Auto fallback to identify the related user if the user does not exist for enterprise SSO.
        if (error instanceof RequestError && error.code === 'user.identity_not_exist') {
          const user = await verificationRecord.identifyRelatedUser();
          const syncedProfile = {
            ...(await verificationRecord.toUserProfile()),
            ...(await verificationRecord.toSyncedProfile()),
          };
          return { user, syncedProfile };
        }
        throw error;
      }
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
