import { type BindMfa, type User, type VerificationType } from '@logto/schemas';

type Data<T> = {
  id: string;
  type: T;
};

/** The abstract class for all verification records. */
export abstract class VerificationRecord<
  T extends VerificationType = VerificationType,
  Json extends Data<T> = Data<T>,
> {
  abstract readonly id: string;
  abstract readonly type: T;

  abstract get isVerified(): boolean;

  abstract toJson(): Json;
}

type IdentifierVerificationType =
  | VerificationType.EmailVerificationCode
  | VerificationType.PhoneVerificationCode
  | VerificationType.Password
  | VerificationType.Social
  | VerificationType.EnterpriseSso;

/**
 * The abstract class for all identifier verification records.
 *
 * - A `identifyUser` method must be provided to identify the user associated with the verification record.
 */
export abstract class IdentifierVerificationRecord<
  T extends VerificationType = IdentifierVerificationType,
  Json extends Data<T> = Data<T>,
> extends VerificationRecord<T, Json> {
  /** Identify the user associated with the verification record. */
  abstract identifyUser(): Promise<User>;
}

type MfaVerificationType =
  | VerificationType.TOTP
  | VerificationType.BackupCode
  | VerificationType.WebAuthn;

export abstract class MfaVerificationRecord<
  T extends MfaVerificationType = MfaVerificationType,
  Json extends Data<T> = Data<T>,
> extends VerificationRecord<T, Json> {
  /**
   * Indicates if the verification record is for a new bind MFA verification.
   * A new bind MFA verification record can not be used for existing user's interaction verification.
   **/
  abstract get isNewBindMfaVerification(): boolean;
  /**
   * Convert the verification record to a BindMfa data type.
   */
  abstract toBindMfa(): BindMfa;
}
