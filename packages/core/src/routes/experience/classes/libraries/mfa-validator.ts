import {
  MfaFactor,
  VerificationType,
  userMfaDataGuard,
  userMfaDataKey,
  type Mfa,
  type User,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { getAllUserEnabledMfaVerifications } from '#src/libraries/mfa.js';
import { isNoSkipMfaPolicy } from '#src/libraries/sign-in-experience/mfa-policy.js';

import { type InteractionProfile } from '../../types.js';
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

export const isMfaVerificationRecord = (
  verification: VerificationRecord
): verification is MfaVerificationRecord => {
  return mfaVerificationTypes.includes(verification.type);
};

export class MfaValidator {
  constructor(
    private readonly mfaSettings: Mfa,
    private readonly user: User,
    private readonly verificationContext: {
      adaptiveMfaResult?: Optional<AdaptiveMfaResult>;
      isMfaRequiredByUser?: boolean;
    } = {}
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
   *    - disabled/skipped MFA + non-Mandatory policy + no user/org requirement → not required
   *    - user has factors → required
   *    - otherwise → not required
   */
  get isMfaRequired(): boolean {
    const hasUserFactors = this.userEnabledMfaVerifications.length > 0;
    const { adaptiveMfaResult, isMfaRequiredByUser } = this.verificationContext;

    if (adaptiveMfaResult !== undefined) {
      // Verification guard only applies when the user already has MFA factors
      // enabled in the current sign-in experience.
      return adaptiveMfaResult.requiresMfa && hasUserFactors;
    }

    const mfaData = userMfaDataGuard.safeParse(this.user.logtoConfig[userMfaDataKey]);
    const skipMfaOnSignIn = mfaData.success ? mfaData.data.skipMfaOnSignIn : undefined;
    const isMfaEnabled = mfaData.success ? mfaData.data.enabled : undefined;

    // If `isMfaEnabled` is undefined, it means the user exists before the `enabled` flag is introduced,
    // we should still enforce MFA for them if they have MFA factors. Only skip the check if mfa is explicitly
    // disabled, or skipped on sign-in, and neither the policy nor a user/org requirement enforces it.
    if (
      (isMfaEnabled === false || skipMfaOnSignIn) &&
      !isNoSkipMfaPolicy(this.mfaSettings.policy) &&
      !isMfaRequiredByUser
    ) {
      return false;
    }

    return hasUserFactors;
  }

  isMfaVerified(verificationRecords: VerificationRecord[]) {
    return this.getVerifiedMfaVerificationRecords(verificationRecords).length > 0;
  }

  hasEligibleTrustedDeviceVerification(
    verificationRecords: VerificationRecord[],
    currentProfile?: InteractionProfile
  ) {
    return this.getVerifiedMfaVerificationRecords(verificationRecords, currentProfile).some(
      ({ type }) => type !== VerificationType.BackupCode
    );
  }

  private getVerifiedMfaVerificationRecords(
    verificationRecords: VerificationRecord[],
    currentProfile?: InteractionProfile
  ) {
    const userEnabledMfaVerifications = getAllUserEnabledMfaVerifications(
      this.mfaSettings,
      this.user,
      currentProfile
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
