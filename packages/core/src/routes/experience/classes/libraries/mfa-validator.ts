import {
  MfaFactor,
  VerificationType,
  type Mfa,
  type MfaVerification,
  type User,
} from '@logto/schemas';

import { type VerificationRecord } from '../verifications/index.js';

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

const isMfaVerificationRecordType = (type: VerificationType): type is MfaVerificationType => {
  return mfaVerificationTypes.includes(type);
};

export class MfaValidator {
  constructor(
    private readonly mfaSettings: Mfa,
    private readonly user: User
  ) {}

  /**
   * Get the enabled MFA factors for the user
   * - Filter out MFA factors that are not configured in the sign-in experience
   */
  get userEnabledMfaVerifications() {
    const { mfaVerifications } = this.user;

    return mfaVerifications.filter((verification) =>
      this.mfaSettings.factors.includes(verification.type)
    );
  }

  /**
   * For front-end display usage only
   * Return the available MFA verifications for the user.
   */
  get availableMfaVerificationTypes() {
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

  get isMfaEnabled() {
    return this.userEnabledMfaVerifications.length > 0;
  }

  isMfaVerified(verificationRecords: VerificationRecord[]) {
    // MFA validation is not enabled
    if (!this.isMfaEnabled) {
      return true;
    }

    const mfaVerificationRecords = this.filterVerifiedMfaVerificationRecords(verificationRecords);

    return mfaVerificationRecords.length > 0;
  }

  filterVerifiedMfaVerificationRecords(verificationRecords: VerificationRecord[]) {
    const enabledMfaFactors = this.userEnabledMfaVerifications;

    // Filter out the verified MFA verification records
    const mfaVerificationRecords = verificationRecords.filter(({ type, isVerified }) => {
      return (
        isVerified &&
        isMfaVerificationRecordType(type) &&
        // Check if the verification type is enabled in the user's MFA settings
        enabledMfaFactors.some((factor) => factor.type === mfaVerificationTypeToMfaFactorMap[type])
      );
    });

    return mfaVerificationRecords;
  }
}
