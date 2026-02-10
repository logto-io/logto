import {
  MfaFactor,
  MfaPolicy,
  VerificationType,
  type LogContextPayload,
  userMfaDataGuard,
  userMfaDataKey,
  type Mfa,
  type User,
} from '@logto/schemas';
import { conditional, type Optional } from '@silverhand/essentials';

import { type LogEntry } from '#src/middleware/koa-audit-log.js';

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
   * Check if the user has any MFA factors bound (configured and enabled in SIE).
   * This is a pure user-state check — it does NOT consider MFA policy or `skipMfaOnSignIn`.
   * For policy-aware decisions, use {@link isMfaRequired} instead.
   */
  get isMfaEnabled() {
    return this.userEnabledMfaVerifications.length > 0;
  }

  /**
   * Check if the MFA verification is required for the current interaction.
   *
   * When adaptive MFA is enabled (result is defined):
   * - If adaptive MFA triggers and user has MFA bound, require MFA verification.
   * - Otherwise, do not require (adaptive not triggered, or user has no MFA).
   *
   * When adaptive MFA is disabled (result is undefined):
   * - Fall back to policy-based check (respects `skipMfaOnSignIn` and MFA policy).
   */
  get isMfaRequired(): boolean {
    return this.mfaRequirement.required;
  }

  /**
   * Append the MFA requirement decision (and adaptive MFA result if present) to the audit log.
   */
  logMfaRequirement(log?: LogEntry) {
    if (!log) {
      return;
    }

    log.append({
      ...conditional(this.adaptiveMfaResult && { adaptiveMfaResult: this.adaptiveMfaResult }),
      mfaRequirement: this.mfaRequirement,
    });
  }

  /**
   * Check if MFA is verified. Returns `true` if the user has no MFA factors bound,
   * or if a valid MFA verification record exists.
   */
  isMfaVerified(verificationRecords: VerificationRecord[]) {
    if (!this.isMfaEnabled) {
      return true;
    }

    return this.isMfaVerifiedForRequirement(verificationRecords);
  }

  /**
   * Check if a valid MFA verification record exists in the given records, regardless of
   * whether MFA is enabled by policy. Used when MFA is unconditionally required
   * (e.g. adaptive MFA triggered).
   */
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

  /**
   * Single source of truth for the MFA requirement decision.
   * Used by both `isMfaRequired` and `logMfaRequirement` to ensure consistency.
   */
  private get mfaRequirement(): NonNullable<LogContextPayload['mfaRequirement']> {
    if (this.adaptiveMfaResult !== undefined) {
      if (this.adaptiveMfaResult.requiresMfa) {
        return {
          required: this.userEnabledMfaVerifications.length > 0,
          source: 'adaptive',
        };
      }

      return { required: false, source: 'none' };
    }

    // Fallback to policy-based check when adaptive MFA is disabled.
    // Respects `skipMfaOnSignIn` unless MFA policy is mandatory.
    const mfaData = userMfaDataGuard.safeParse(this.user.logtoConfig[userMfaDataKey]);
    const skipMfaOnSignIn = mfaData.success ? mfaData.data.skipMfaOnSignIn : undefined;

    if (skipMfaOnSignIn && this.mfaSettings.policy !== MfaPolicy.Mandatory) {
      return { required: false, source: 'none' };
    }

    const fallback = this.isMfaEnabled;
    return { required: fallback, source: fallback ? 'policy' : 'none' };
  }
}
