/**
 * @overview The MFA factors a user has configured, i.e. the stored MFA verifications and the
 * email and phone factors, as enabled in the sign-in experience. Sign-in, organization token
 * issuance, step-up, and the tenant MFA status share this rule; whether the email and phone
 * factors need a stored record is decided by `resolveUserMfaFactors` in `@logto/schemas`.
 */

import { MfaFactor, resolveUserMfaFactors, type Mfa, type User } from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';

/** The profile that provides the primary identifiers of the email and phone MFA factors. */
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
 * Get all enabled MFA verifications for a user: the stored factors, then the email and phone
 * factors, then backup codes.
 * @param mfaSettings - MFA settings from sign-in experience
 * @param user - User object with mfaVerifications and profile data
 * @param currentProfile - Optional profile override (for current interaction contexts), in cases of MFA verification, this is not needed
 * @param stagedMfaFactors - Optional MFA factors bound in the current interaction before submission
 * @returns Array of all enabled MFA verifications
 */
export const getAllUserEnabledMfaVerifications = (
  mfaSettings: Mfa,
  user: Pick<User, 'mfaVerifications' | 'primaryEmail' | 'primaryPhone'>,
  currentProfile?: MfaProfile,
  stagedMfaFactors: readonly MfaFactor[] = []
): MfaFactor[] => {
  const storedVerifications = filterOutEmptyBackupCodes(user.mfaVerifications)
    .filter((verification) => mfaSettings.factors.includes(verification.type))
    // Sort by priority:
    // 1) WebAuthn always first if available
    // 2) Backup code always last
    // 3) Otherwise by last used time (desc)
    // Email and phone records are placed after the other stored factors by
    // `resolveUserMfaFactors`, so they never take part in this order.
    .toSorted((verificationA, verificationB) => {
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

  return resolveUserMfaFactors({
    mfaSettings,
    storedFactors: [...storedVerifications, ...stagedMfaFactors],
    hasPrimaryEmail: Boolean(currentProfile?.primaryEmail ?? user.primaryEmail),
    hasPrimaryPhone: Boolean(currentProfile?.primaryPhone ?? user.primaryPhone),
  });
};
