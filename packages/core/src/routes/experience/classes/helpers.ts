/**
 * @overview This file contains helper functions for the main interaction class.
 *
 * To help reduce the complexity and code amount of the main interaction class,
 * we have moved some of the standalone functions into this file.
 */

import {
  MfaFactor,
  VerificationType,
  type User,
  InteractionEvent,
  type UserLogtoConfig,
  userMfaDataKey,
  userPasskeySignInDataKey,
  type JsonObject,
  userLogtoConfigGuard,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import type { InteractionProfile, UserMfaVerificationsData } from '../types.js';

import { type VerificationRecord } from './verifications/index.js';

/**
 * @throws {RequestError} with status 400 if the verification record type is not supported for user creation.
 * @throws {RequestError} with status 400 if the verification record is not verified.
 */
export const getNewUserProfileFromVerificationRecord = async (
  verificationRecord: VerificationRecord
): Promise<InteractionProfile> => {
  switch (verificationRecord.type) {
    case VerificationType.NewPasswordIdentity:
    case VerificationType.EmailVerificationCode:
    case VerificationType.PhoneVerificationCode:
    case VerificationType.OneTimeToken: {
      return verificationRecord.toUserProfile();
    }
    case VerificationType.EnterpriseSso:
    case VerificationType.Social: {
      const [identityProfile, syncedProfile] = await Promise.all([
        verificationRecord.toUserProfile(),
        // Set `isNewUser` to true to specify syncing profile from the
        // social/enterprise SSO identity for a new user.
        verificationRecord.toSyncedProfile(true),
      ]);

      const tokenSetSecretProfile =
        verificationRecord.type === VerificationType.Social
          ? { socialConnectorTokenSetSecret: await verificationRecord.getTokenSetSecret() }
          : { enterpriseSsoConnectorTokenSetSecret: verificationRecord.getTokenSetSecret() };

      return {
        ...identityProfile,
        ...syncedProfile,
        ...tokenSetSecretProfile,
      };
    }
    default: {
      // Unsupported verification type for user creation, such as MFA verification.
      throw new RequestError({ code: 'session.verification_failed', status: 400 });
    }
  }
};

const order: MfaFactor[] = [
  MfaFactor.WebAuthn,
  MfaFactor.TOTP,
  MfaFactor.PhoneVerificationCode,
  MfaFactor.EmailVerificationCode,
  MfaFactor.BackupCode,
];

/**
 * Sort MFA factors by display priority to keep client experience consistent.
 * Order: WebAuthn -> TOTP -> Phone -> Email -> Backup code -> others.
 */
export const sortMfaFactors = (factors: MfaFactor[]): MfaFactor[] => {
  return factors.slice().sort((factorA, factorB) => {
    const indexA = order.indexOf(factorA);
    const indexB = order.indexOf(factorB);
    const normalizedIndexA = indexA === -1 ? order.length : indexA;
    const normalizedIndexB = indexB === -1 ? order.length : indexB;

    return normalizedIndexA - normalizedIndexB;
  });
};

/**
 * @throws {RequestError} -400 if the verification record type is not supported for user identification.
 * @throws {RequestError} -400 if the verification record is not verified.
 * @throws {RequestError} -404 if the user is not found.
 */
// eslint-disable-next-line complexity
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
    | 'enterpriseSsoIdentity'
    | 'syncedEnterpriseSsoIdentity'
    | 'jitOrganizationIds'
    | 'socialIdentity'
    | 'avatar'
    | 'name'
    | 'socialConnectorTokenSetSecret'
    | 'enterpriseSsoConnectorTokenSetSecret'
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
    case VerificationType.EmailVerificationCode:
    case VerificationType.PhoneVerificationCode:
    case VerificationType.MfaEmailVerificationCode:
    case VerificationType.MfaPhoneVerificationCode:
    case VerificationType.SignInPasskey: {
      return {
        user: await verificationRecord.identifyUser(),
      };
    }
    case VerificationType.OneTimeToken: {
      return {
        user: await verificationRecord.identifyUser(),
        syncedProfile: {
          jitOrganizationIds: verificationRecord.oneTimeTokenContext?.jitOrganizationIds,
        },
      };
    }
    case VerificationType.Social: {
      const user = linkSocialIdentity
        ? await verificationRecord.identifyRelatedUser()
        : await verificationRecord.identifyUser();

      const syncedProfile = {
        ...(await verificationRecord.toSyncedProfile()),
        ...conditional(linkSocialIdentity && (await verificationRecord.toUserProfile())),
        socialConnectorTokenSetSecret: await verificationRecord.getTokenSetSecret(),
      };

      return { user, syncedProfile };
    }
    case VerificationType.EnterpriseSso: {
      try {
        const user = await verificationRecord.identifyUser();
        const { enterpriseSsoIdentity } = verificationRecord.toUserProfile();
        // Sync the enterprise SSO identity details
        const syncedProfile = {
          syncedEnterpriseSsoIdentity: enterpriseSsoIdentity,
          ...(await verificationRecord.toSyncedProfile()),
          enterpriseSsoConnectorTokenSetSecret: verificationRecord.getTokenSetSecret(),
        };
        return { user, syncedProfile };
      } catch (error: unknown) {
        // Auto fallback to identify the related user if the user does not exist for enterprise SSO.
        if (error instanceof RequestError && error.code === 'user.sso_identity_not_exist') {
          const user = await verificationRecord.identifyRelatedUser();

          const syncedProfile = {
            ...verificationRecord.toUserProfile(),
            ...(await verificationRecord.toSyncedProfile()),
            enterpriseSsoConnectorTokenSetSecret: verificationRecord.getTokenSetSecret(),
          };
          return { user, syncedProfile };
        }
        throw error;
      }
    }
  }
};

/**
 * Should remove the old backup codes verification if the user is binding a new one
 */
export const mergeUserMfaVerifications = (
  userMfaVerifications: User['mfaVerifications'],
  newMfaVerifications: User['mfaVerifications']
): User['mfaVerifications'] => {
  if (newMfaVerifications.some((verification) => verification.type === MfaFactor.BackupCode)) {
    const filteredMfaVerifications = userMfaVerifications.filter(({ type }) => {
      return type !== MfaFactor.BackupCode;
    });
    return [...filteredMfaVerifications, ...newMfaVerifications];
  }

  return [...userMfaVerifications, ...newMfaVerifications];
};

/**
 * Format the MFA verifications data to be updated in the user account
 * @param mfaVerificationData - The data of MFA verifications to be updated, including the enabled status, skipped status and the MFAverifications array.
 * @returns An object containing the formatted MFA data to be updated in the user account.
 * @remarks
 * - The `enabled` field is determined by the presence of any MFA verifications. If there are MFA verifications, it will be set to true;
 *   otherwise, it will be false. This is because the `enabled` field is newly introduced and legacy users may not have this field in their config.
 *   The absence of `enabled` field will be treated as MFA not enabled after the next sign-in attempt.
 * - The `skipped` field is only set when the user has explicitly skipped MFA. This is to persist the skipped status for users who have chosen to skip MFA.
 * - The `additionalBindingSuggestionSkipped` field is only set when user has explicitly skipped the optional additional MFA suggestion.
 * - The `passkeySkipped` status is only persisted during sign-in event. This is to allow users who skipped binding passkey during registration to be prompted
 *   again during the first sign-in attempt.
 * - The returned object is structured to be directly used for updating the user account with the new MFA settings.
 */
export const parseMfaPropertiesToUserConfig = (
  logtoConfig: JsonObject,
  mfaVerificationData: UserMfaVerificationsData,
  interactionEvent: InteractionEvent
): UserLogtoConfig => {
  const { mfaEnabled, mfaSkipped, additionalBindingSuggestionSkipped, passkeySkipped } =
    mfaVerificationData;
  const userMfaData = userLogtoConfigGuard.safeParse(logtoConfig).data?.[userMfaDataKey];
  return {
    ...logtoConfig,
    [userMfaDataKey]: {
      ...userMfaData,
      // Force cast optional value to boolean since the `enabled` field is newly introduced and legacy users may NOT have this field
      // in their config. The absence of `enabled` field will be treated as MFA not enabled after the next sign-in attempt.
      ...conditional(mfaEnabled !== undefined && { enabled: mfaEnabled }),
      // For users who have explicitly skipped MFA, set `skipped` to true to persist the skipped status.
      ...conditional(mfaSkipped && { skipped: true }),
      // Persist optional additional MFA suggestion skipped status when user explicitly skips it.
      ...conditional(
        additionalBindingSuggestionSkipped && { additionalBindingSuggestionSkipped: true }
      ),
    },
    ...conditional(
      // Only persist passkey skipped status on sign-in event. So users who skipped binding passkey during registration will be prompted
      // again during the first sign-in attempt.
      passkeySkipped &&
        interactionEvent === InteractionEvent.SignIn && {
          [userPasskeySignInDataKey]: {
            skipped: true,
          },
        }
    ),
  };
};
