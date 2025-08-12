/**
 * @overview This file contains helper functions for the main interaction class.
 *
 * To help reduce the complexity and code amount of the main interaction class,
 * we have moved some of the standalone functions into this file.
 */

import { defaults, parseAffiliateData } from '@logto/affiliate';
import { adminTenantId, MfaFactor, VerificationType, type User, type Mfa } from '@logto/schemas';
import { conditional, trySafe } from '@silverhand/essentials';
import { type IRouterContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import assertThat from '#src/utils/assert-that.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';

import type { InteractionProfile } from '../types.js';

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
    case VerificationType.PhoneVerificationCode: {
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
        if (error instanceof RequestError && error.code === 'user.identity_not_exist') {
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
 * Filter out backup codes mfa verifications that have been used
 */
const filterOutEmptyBackupCodes = (
  mfaVerifications: User['mfaVerifications']
): User['mfaVerifications'] =>
  mfaVerifications.filter((mfa) => {
    if (mfa.type === MfaFactor.BackupCode) {
      return mfa.codes.some((code) => !code.usedAt);
    }
    return true;
  });

/**
 * Get all enabled MFA verifications for a user (stored + implicit)
 * @param mfaSettings - MFA settings from sign-in experience
 * @param user - User object with mfaVerifications and profile data
 * @param currentProfile - Optional profile override (for current interaction contexts), in cases of MFA verification, this is not needed
 * @returns Array of all enabled MFA verifications
 */
export const getAllUserEnabledMfaVerifications = (
  mfaSettings: Mfa,
  user: User,
  currentProfile?: InteractionProfile
): MfaFactor[] => {
  const storedVerifications = filterOutEmptyBackupCodes(user.mfaVerifications)
    .filter((verification) => mfaSettings.factors.includes(verification.type))
    // Filter out backup codes if all the codes are used
    .filter((verification) => {
      if (verification.type !== MfaFactor.BackupCode) {
        return true;
      }
      return verification.codes.some((code) => !code.usedAt);
    })
    .slice()
    // Sort by last used time, the latest used factor is the first one, backup code is always the last one
    .sort((verificationA, verificationB) => {
      if (verificationA.type === MfaFactor.BackupCode) {
        return 1;
      }

      if (verificationB.type === MfaFactor.BackupCode) {
        return -1;
      }

      return (
        new Date(verificationB.lastUsedAt ?? 0).getTime() -
        new Date(verificationA.lastUsedAt ?? 0).getTime()
      );
    })
    .map(({ type }) => type);

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return storedVerifications;
  }

  const email = currentProfile?.primaryEmail ?? user.primaryEmail;
  const phone = currentProfile?.primaryPhone ?? user.primaryPhone;

  const implicitVerifications = [
    // Email MFA Factor: user has primaryEmail + Email factor enabled in SIE
    ...(mfaSettings.factors.includes(MfaFactor.EmailVerificationCode) && email
      ? [MfaFactor.EmailVerificationCode]
      : []),
    // Phone MFA Factor: user has primaryPhone + Phone factor enabled in SIE
    ...(mfaSettings.factors.includes(MfaFactor.PhoneVerificationCode) && phone
      ? [MfaFactor.PhoneVerificationCode]
      : []),
  ];

  return [...storedVerifications, ...implicitVerifications];
};

/**
 * Post affiliate data to the cloud service.
 */
export const postAffiliateLogs = async (
  ctx: IRouterContext,
  cloudConnection: CloudConnectionLibrary,
  userId: string,
  tenantId: string
) => {
  if (!EnvSet.values.isCloud || tenantId !== adminTenantId) {
    return;
  }

  const affiliateData = trySafe(() =>
    parseAffiliateData(JSON.parse(decodeURIComponent(ctx.cookies.get(defaults.cookieName) ?? '')))
  );

  if (affiliateData) {
    const client = await cloudConnection.getClient();
    await client.post('/api/affiliate-logs', {
      body: { userId, ...affiliateData },
    });
    getConsoleLogFromContext(ctx).info('Affiliate logs posted', userId);
  }
};
