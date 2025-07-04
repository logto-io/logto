import {
  MfaFactor,
  MfaPolicy,
  VerificationType,
  type Mfa,
  type MfaVerification,
  type User,
} from '@logto/schemas';

import { type BackupCodeVerification } from '../verifications/backup-code-verification.js';
import { type VerificationRecord } from '../verifications/index.js';
import { type TotpVerification } from '../verifications/totp-verification.js';
import { type WebAuthnVerification } from '../verifications/web-authn-verification.js';

const mfaVerificationTypes = Object.freeze([
  VerificationType.TOTP,
  VerificationType.BackupCode,
  VerificationType.WebAuthn,
]);

type MfaVerificationType =
  | VerificationType.TOTP
  | VerificationType.BackupCode
  | VerificationType.WebAuthn;

const mfaVerificationTypeToMfaFactorMap = Object.freeze({
  [VerificationType.TOTP]: MfaFactor.TOTP,
  [VerificationType.BackupCode]: MfaFactor.BackupCode,
  [VerificationType.WebAuthn]: MfaFactor.WebAuthn,
}) satisfies Record<MfaVerificationType, MfaFactor>;

type MfaVerificationRecord = TotpVerification | WebAuthnVerification | BackupCodeVerification;

const isMfaVerificationRecord = (
  verification: VerificationRecord
): verification is MfaVerificationRecord => {
  return mfaVerificationTypes.includes(verification.type);
};

export class MfaValidator {
  constructor(
    private readonly mfaSettings: Mfa,
    private readonly user: User
  ) {}

  /**
   * Get the enabled MFA factors for the user
   *
   * - Filter out MFA factors that are not configured in the sign-in experience
   */
  get userEnabledMfaVerifications() {
    const { mfaVerifications } = this.user;

    return mfaVerifications.filter((verification) =>
      this.mfaSettings.factors.includes(verification.type)
    );
  }

  /**
   * For front-end display usage only.
   * Returns all the available MFA verifications for the user that can be used for verification.
   *
   * - Filter out backup codes if all the codes are used
   * - Filter out duplicated verifications with the same type
   * - Sort by last used time, the latest used factor is the first one, backup code is always the last one
   */
  get availableUserMfaVerificationTypes() {
    return (
      this.userEnabledMfaVerifications
        // Filter out backup codes if all the codes are used
        .filter((verification) => {
          if (verification.type !== MfaFactor.BackupCode) {
            return true;
          }
          return verification.codes.some((code) => !code.usedAt);
        })
        // Filter out duplicated verifications with the same type
        .reduce<MfaVerification[]>((verifications, verification) => {
          if (verifications.some(({ type }) => type === verification.type)) {
            return verifications;
          }

          return [...verifications, verification];
        }, [])
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
        .map(({ type }) => type)
    );
  }

  /**
   * Check if the user has enabled MFA verifications, if true, MFA verification records are required.
   */
  get isMfaEnabled() {
    // Users can manually disable MFA verification requirement for sign-in,
    // but if the MFA policy is set to mandatory, this setting will be ignored.
    if (!this.user.requireMfaOnSignIn && this.mfaSettings.policy !== MfaPolicy.Mandatory) {
      return false;
    }

    return this.userEnabledMfaVerifications.length > 0;
  }

  isMfaVerified(verificationRecords: VerificationRecord[]) {
    // MFA validation is not enabled
    if (!this.isMfaEnabled) {
      return true;
    }

    const verifiedMfaVerificationRecords = verificationRecords.filter(
      (verification) =>
        isMfaVerificationRecord(verification) &&
        verification.isVerified &&
        // New bind MFA verification can not be used for verification
        !verification.isNewBindMfaVerification &&
        // Check if the verification type is enabled in the user's MFA settings
        this.userEnabledMfaVerifications.some(
          (factor) => factor.type === mfaVerificationTypeToMfaFactorMap[verification.type]
        )
    );

    return verifiedMfaVerificationRecords.length > 0;
  }
}
