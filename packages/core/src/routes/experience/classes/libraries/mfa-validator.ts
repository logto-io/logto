import {
  MfaFactor,
  MfaPolicy,
  VerificationType,
  userMfaDataGuard,
  userMfaDataKey,
  type Mfa,
  type User,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { getAllUserEnabledMfaVerifications } from '../helpers.js';
import { type BackupCodeVerification } from '../verifications/backup-code-verification.js';
import {
  type MfaEmailCodeVerification,
  type MfaPhoneCodeVerification,
} from '../verifications/code-verification.js';
import { type VerificationRecord } from '../verifications/index.js';
import { type TotpVerification } from '../verifications/totp-verification.js';
import { type WebAuthnVerification } from '../verifications/web-authn-verification.js';

import type { AdaptiveMfaResult } from './adaptive-mfa-validator/types.js';

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

const isMfaVerificationRecord = (
  verification: VerificationRecord
): verification is MfaVerificationRecord => {
  return mfaVerificationTypes.includes(verification.type);
};

export class MfaValidator {
  constructor(
    private readonly mfaSettings: Mfa,
    private readonly user: User,
    private readonly adaptiveMfaResult?: Optional<AdaptiveMfaResult>
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
        // Filter out duplicated verifications with the same type
        .reduce<MfaFactor[]>((verifications, verification) => {
          if (verifications.includes(verification)) {
            return verifications;
          }

          return [...verifications, verification];
        }, [])
    );
  }

  /**
   * Whether MFA verification is required for the current sign-in interaction.
   *
   * Decision order:
   * 1. If adaptive MFA is enabled (result defined):
   *    - triggered + user has factors → required
   *    - otherwise → not required
   * 2. If adaptive MFA is disabled (result undefined), fall back to SIE policy:
   *    - skipMfaOnSignIn + non-Mandatory policy → not required
   *    - user has factors → required
   *    - otherwise → not required
   */
  get isMfaRequired(): boolean {
    const hasUserFactors = this.userEnabledMfaVerifications.length > 0;

    if (this.adaptiveMfaResult !== undefined) {
      // TODO: When adaptive MFA triggers (requiresMfa === true) but the user has no MFA factors
      // enabled, we should still enforce MFA. Currently we return false and skip MFA in this case,
      // which means the risk signal is silently ignored. Once the product decision is finalized,
      // add handling here (e.g. prompt the user to set up MFA before proceeding).
      return this.adaptiveMfaResult.requiresMfa && hasUserFactors;
    }

    const mfaData = userMfaDataGuard.safeParse(this.user.logtoConfig[userMfaDataKey]);
    const skipMfaOnSignIn = mfaData.success ? mfaData.data.skipMfaOnSignIn : undefined;

    if (skipMfaOnSignIn && this.mfaSettings.policy !== MfaPolicy.Mandatory) {
      return false;
    }

    return hasUserFactors;
  }

  isMfaVerifiedForRequirement(verificationRecords: VerificationRecord[]) {
    const verifiedMfaVerificationRecords = verificationRecords.filter(
      (verification) =>
        isMfaVerificationRecord(verification) &&
        verification.isVerified &&
        // New bind MFA verification can not be used for verification
        !verification.isNewBindMfaVerification &&
        // Check if the verification type is enabled in the user's MFA settings
        this.userEnabledMfaVerifications.includes(
          mfaVerificationTypeToMfaFactorMap[verification.type]
        )
    );

    return verifiedMfaVerificationRecords.length > 0;
  }
}
