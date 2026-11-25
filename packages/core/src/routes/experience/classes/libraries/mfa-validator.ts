import { MfaFactor, VerificationType, type Mfa, type User } from '@logto/schemas';

import { getAllUserEnabledMfaVerifications } from '#src/libraries/mfa.js';

import { type InteractionProfile } from '../../types.js';
import { type BackupCodeVerification } from '../verifications/backup-code-verification.js';
import {
  type MfaEmailCodeVerification,
  type MfaPhoneCodeVerification,
} from '../verifications/code-verification.js';
import { type VerificationRecord } from '../verifications/index.js';
import { type TotpVerification } from '../verifications/totp-verification.js';
import { type WebAuthnVerification } from '../verifications/web-authn-verification.js';

const mfaVerificationTypes = Object.freeze([
  VerificationType.TOTP,
  VerificationType.BackupCode,
  VerificationType.WebAuthn,
  VerificationType.MfaEmailVerificationCode,
  VerificationType.MfaPhoneVerificationCode,
]);

type MfaVerificationType =
  | VerificationType.TOTP
  | VerificationType.BackupCode
  | VerificationType.WebAuthn
  | VerificationType.MfaEmailVerificationCode
  | VerificationType.MfaPhoneVerificationCode;

const mfaVerificationTypeToMfaFactorMap = Object.freeze({
  [VerificationType.TOTP]: MfaFactor.TOTP,
  [VerificationType.BackupCode]: MfaFactor.BackupCode,
  [VerificationType.WebAuthn]: MfaFactor.WebAuthn,
  [VerificationType.MfaEmailVerificationCode]: MfaFactor.EmailVerificationCode,
  [VerificationType.MfaPhoneVerificationCode]: MfaFactor.PhoneVerificationCode,
}) satisfies Record<MfaVerificationType, MfaFactor>;

type MfaVerificationRecord =
  | TotpVerification
  | WebAuthnVerification
  | BackupCodeVerification
  | MfaEmailCodeVerification
  | MfaPhoneCodeVerification;

export const isMfaVerificationRecord = (
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
   * - Include implicit Email and Phone MFA factors if user has them and they're enabled in SIE
   */
  get userEnabledMfaVerifications() {
    return getAllUserEnabledMfaVerifications(this.mfaSettings, this.user);
  }

  get availableUserMfaVerificationTypes() {
    return (
      this.userEnabledMfaVerifications
        // Filter out duplicated verifications with the same type
        .reduce<MfaFactor[]>((verifications, verification) => {
          if (verifications.includes(verification)) {
            return verifications;
          }

          return [...verifications, verification];
        }, [])
    );
  }

  isMfaVerified(verificationRecords: VerificationRecord[]) {
    return this.getVerifiedMfaVerificationRecords(verificationRecords).length > 0;
  }

  hasEligibleTrustedDeviceVerification(
    verificationRecords: VerificationRecord[],
    currentProfile?: InteractionProfile,
    stagedMfaFactors?: readonly MfaFactor[]
  ) {
    return this.getVerifiedMfaVerificationRecords(
      verificationRecords,
      currentProfile,
      stagedMfaFactors
    ).some(({ type }) => type !== VerificationType.BackupCode);
  }

  private getVerifiedMfaVerificationRecords(
    verificationRecords: VerificationRecord[],
    currentProfile?: InteractionProfile,
    stagedMfaFactors?: readonly MfaFactor[]
  ) {
    const userEnabledMfaVerifications = getAllUserEnabledMfaVerifications(
      this.mfaSettings,
      this.user,
      currentProfile,
      stagedMfaFactors
    );

    return verificationRecords.filter(
      (verification) =>
        isMfaVerificationRecord(verification) &&
        verification.isVerified &&
        // New bind MFA verification can not be used for verification
        !verification.isNewBindMfaVerification &&
        // An MFA challenge is created for one account and answers for that account only, so a
        // record counts only for the user it names. Every type names its owner at creation, so a
        // record without one was not created for any user and counts for nobody.
        verification.userId === this.user.id &&
        // Check if the verification type is enabled in the user's MFA settings
        userEnabledMfaVerifications.includes(mfaVerificationTypeToMfaFactorMap[verification.type])
    );
  }
}
