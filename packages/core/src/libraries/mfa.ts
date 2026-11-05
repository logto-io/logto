/**
 * @overview The MFA factors a user has configured, i.e. the stored MFA verifications and the
 * implicit email and phone factors, as enabled in the sign-in experience. Sign-in, organization
 * token issuance, and the tenant MFA status share this rule.
 */

import { MfaFactor, type Mfa, type User } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

/** The profile that provides the implicit email and phone MFA factors. */
type MfaProfile = {
  primaryEmail?: Nullable<string>;
  primaryPhone?: Nullable<string>;
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
 * Resolve implicit profile-based MFA factors (Email/Phone) from the provided profile source.
 */
export const getProfileMfaFactors = (
  mfaSettings: Mfa,
  { primaryEmail, primaryPhone }: MfaProfile
): MfaFactor[] => {
  return [
    ...(mfaSettings.factors.includes(MfaFactor.PhoneVerificationCode) && primaryPhone
      ? [MfaFactor.PhoneVerificationCode]
      : []),
    ...(mfaSettings.factors.includes(MfaFactor.EmailVerificationCode) && primaryEmail
      ? [MfaFactor.EmailVerificationCode]
      : []),
  ];
};

/**
 * Get all enabled MFA verifications for a user (stored + implicit)
 * @param mfaSettings - MFA settings from sign-in experience
 * @param user - User object with mfaVerifications and profile data
 * @param currentProfile - Optional profile override (for current interaction contexts), in cases of MFA verification, this is not needed
 * @returns Array of all enabled MFA verifications
 */
export const getAllUserEnabledMfaVerifications = (
  mfaSettings: Mfa,
  user: Pick<User, 'mfaVerifications' | 'primaryEmail' | 'primaryPhone'>,
  currentProfile?: MfaProfile
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
    // Sort by priority:
    // 1) WebAuthn always first if available
    // 2) Backup code always last
    // 3) Otherwise by last used time (desc)
    .sort((verificationA, verificationB) => {
      // WebAuthn to the front whenever present
      if (verificationA.type === MfaFactor.WebAuthn && verificationB.type !== MfaFactor.WebAuthn) {
        return -1;
      }
      if (verificationB.type === MfaFactor.WebAuthn && verificationA.type !== MfaFactor.WebAuthn) {
        return 1;
      }

      // Backup codes to the end
      if (verificationA.type === MfaFactor.BackupCode) {
        return 1;
      }
      if (verificationB.type === MfaFactor.BackupCode) {
        return -1;
      }

      // Recent first for the rest
      return (
        new Date(verificationB.lastUsedAt ?? 0).getTime() -
        new Date(verificationA.lastUsedAt ?? 0).getTime()
      );
    })
    .map(({ type }) => type);

  const implicitVerifications = getProfileMfaFactors(mfaSettings, {
    primaryEmail: currentProfile?.primaryEmail ?? user.primaryEmail,
    primaryPhone: currentProfile?.primaryPhone ?? user.primaryPhone,
  });

  return [...storedVerifications, ...implicitVerifications].slice().sort((factorA, factorB) => {
    // Backup code always comes last
    if (factorA === MfaFactor.BackupCode) {
      return 1;
    }
    if (factorB === MfaFactor.BackupCode) {
      return -1;
    }
    return 0;
  });
};
