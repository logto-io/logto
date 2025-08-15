import {
  mfaEmailCodeVerificationRecordDataGuard,
  mfaPhoneCodeVerificationRecordDataGuard,
  VerificationType,
} from '@logto/schemas';
import { z } from 'zod';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import {
  BackupCodeVerification,
  backupCodeVerificationRecordDataGuard,
  sanitizedBackupCodeVerificationRecordDataGuard,
  type BackupCodeVerificationRecordData,
  type SanitizedBackupCodeVerificationRecordData,
} from './backup-code-verification.js';
import {
  EmailCodeVerification,
  emailCodeVerificationRecordDataGuard,
  PhoneCodeVerification,
  phoneCodeVerificationRecordDataGuard,
  MfaEmailCodeVerification,
  MfaPhoneCodeVerification,
  type CodeVerificationRecordData,
} from './code-verification.js';
import {
  EnterpriseSsoVerification,
  enterpriseSsoVerificationRecordDataGuard,
  sanitizedEnterpriseSsoVerificationRecordDataGuard,
  type SanitizedEnterpriseSsoVerificationRecordData,
  type EnterpriseSsoVerificationRecordData,
} from './enterprise-sso-verification.js';
import {
  NewPasswordIdentityVerification,
  newPasswordIdentityVerificationRecordDataGuard,
  sanitizedNewPasswordIdentityVerificationRecordDataGuard,
  type NewPasswordIdentityVerificationRecordData,
  type SanitizedNewPasswordIdentityVerificationRecordData,
} from './new-password-identity-verification.js';
import {
  OneTimeTokenVerification,
  oneTimeTokenVerificationRecordDataGuard,
  type OneTimeTokenVerificationRecordData,
} from './one-time-token-verification.js';
import {
  PasswordVerification,
  passwordVerificationRecordDataGuard,
  type PasswordVerificationRecordData,
} from './password-verification.js';
import {
  SocialVerification,
  socialVerificationRecordDataGuard,
  sanitizedSocialVerificationRecordDataGuard,
  type SocialVerificationRecordData,
  type SanitizedSocialVerificationRecordData,
} from './social-verification.js';
import {
  TotpVerification,
  totpVerificationRecordDataGuard,
  sanitizedTotpVerificationRecordDataGuard,
  type TotpVerificationRecordData,
  type SanitizedTotpVerificationRecordData,
} from './totp-verification.js';
import { type VerificationRecord as GenericVerificationRecord } from './verification-record.js';
import {
  WebAuthnVerification,
  webAuthnVerificationRecordDataGuard,
  sanitizedWebAuthnVerificationRecordDataGuard,
  type WebAuthnVerificationRecordData,
  type SanitizedWebAuthnVerificationRecordData,
} from './web-authn-verification.js';

export type VerificationRecordData =
  | PasswordVerificationRecordData
  | CodeVerificationRecordData<VerificationType.EmailVerificationCode>
  | CodeVerificationRecordData<VerificationType.PhoneVerificationCode>
  | CodeVerificationRecordData<VerificationType.MfaEmailVerificationCode>
  | CodeVerificationRecordData<VerificationType.MfaPhoneVerificationCode>
  | SocialVerificationRecordData
  | EnterpriseSsoVerificationRecordData
  | TotpVerificationRecordData
  | BackupCodeVerificationRecordData
  | WebAuthnVerificationRecordData
  | NewPasswordIdentityVerificationRecordData
  | OneTimeTokenVerificationRecordData;

export type SanitizedVerificationRecordData =
  | PasswordVerificationRecordData
  | CodeVerificationRecordData<VerificationType.EmailVerificationCode>
  | CodeVerificationRecordData<VerificationType.PhoneVerificationCode>
  | CodeVerificationRecordData<VerificationType.MfaEmailVerificationCode>
  | CodeVerificationRecordData<VerificationType.MfaPhoneVerificationCode>
  | SanitizedSocialVerificationRecordData
  | SanitizedEnterpriseSsoVerificationRecordData
  | SanitizedTotpVerificationRecordData
  | SanitizedBackupCodeVerificationRecordData
  | SanitizedWebAuthnVerificationRecordData
  | SanitizedNewPasswordIdentityVerificationRecordData
  | OneTimeTokenVerificationRecordData;

// This is to ensure the keys of the map are the same as the type of the verification record
type VerificationRecordInterfaceMap = {
  [K in VerificationType]?: GenericVerificationRecord<K>;
};
type AssertVerificationMap<T extends VerificationRecordInterfaceMap> = T;

export type VerificationRecordMap = AssertVerificationMap<{
  [VerificationType.Password]: PasswordVerification;
  [VerificationType.EmailVerificationCode]: EmailCodeVerification;
  [VerificationType.PhoneVerificationCode]: PhoneCodeVerification;
  [VerificationType.MfaEmailVerificationCode]: MfaEmailCodeVerification;
  [VerificationType.MfaPhoneVerificationCode]: MfaPhoneCodeVerification;
  [VerificationType.Social]: SocialVerification;
  [VerificationType.EnterpriseSso]: EnterpriseSsoVerification;
  [VerificationType.TOTP]: TotpVerification;
  [VerificationType.BackupCode]: BackupCodeVerification;
  [VerificationType.WebAuthn]: WebAuthnVerification;
  [VerificationType.NewPasswordIdentity]: NewPasswordIdentityVerification;
  [VerificationType.OneTimeToken]: OneTimeTokenVerification;
}>;

type ValueOf<T> = T[keyof T];
/**
 * Union type for all verification record types
 *
 * @remarks This is a discriminated union type.
 * The `VerificationRecord` generic class can not narrow down the type of a verification record instance by its type property.
 * This union type is used to narrow down the type of the verification record.
 * Used in the `ExperienceInteraction` class to store and manage all the verification records. With a given verification type, we can narrow down the type of the verification record.
 */
export type VerificationRecord = ValueOf<VerificationRecordMap>;

export const verificationRecordDataGuard = z.discriminatedUnion('type', [
  passwordVerificationRecordDataGuard,
  emailCodeVerificationRecordDataGuard,
  phoneCodeVerificationRecordDataGuard,
  mfaEmailCodeVerificationRecordDataGuard,
  mfaPhoneCodeVerificationRecordDataGuard,
  socialVerificationRecordDataGuard,
  enterpriseSsoVerificationRecordDataGuard,
  totpVerificationRecordDataGuard,
  backupCodeVerificationRecordDataGuard,
  webAuthnVerificationRecordDataGuard,
  newPasswordIdentityVerificationRecordDataGuard,
  oneTimeTokenVerificationRecordDataGuard,
]);

export const publicVerificationRecordDataGuard = z.discriminatedUnion('type', [
  passwordVerificationRecordDataGuard,
  emailCodeVerificationRecordDataGuard,
  phoneCodeVerificationRecordDataGuard,
  mfaEmailCodeVerificationRecordDataGuard,
  mfaPhoneCodeVerificationRecordDataGuard,
  sanitizedSocialVerificationRecordDataGuard,
  sanitizedEnterpriseSsoVerificationRecordDataGuard,
  sanitizedTotpVerificationRecordDataGuard,
  sanitizedBackupCodeVerificationRecordDataGuard,
  sanitizedWebAuthnVerificationRecordDataGuard,
  sanitizedNewPasswordIdentityVerificationRecordDataGuard,
  oneTimeTokenVerificationRecordDataGuard,
]);

/**
 * The factory method to build a new `VerificationRecord` instance based on the provided `VerificationRecordData`.
 */
// eslint-disable-next-line complexity
export const buildVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  data: VerificationRecordData
) => {
  switch (data.type) {
    case VerificationType.Password: {
      return new PasswordVerification(libraries, queries, data);
    }
    case VerificationType.EmailVerificationCode: {
      return new EmailCodeVerification(libraries, queries, data);
    }
    case VerificationType.PhoneVerificationCode: {
      return new PhoneCodeVerification(libraries, queries, data);
    }
    case VerificationType.MfaEmailVerificationCode: {
      return new MfaEmailCodeVerification(libraries, queries, data);
    }
    case VerificationType.MfaPhoneVerificationCode: {
      return new MfaPhoneCodeVerification(libraries, queries, data);
    }
    case VerificationType.Social: {
      return new SocialVerification(libraries, queries, data);
    }
    case VerificationType.EnterpriseSso: {
      return new EnterpriseSsoVerification(libraries, queries, data);
    }
    case VerificationType.TOTP: {
      return new TotpVerification(libraries, queries, data);
    }
    case VerificationType.BackupCode: {
      return new BackupCodeVerification(libraries, queries, data);
    }
    case VerificationType.WebAuthn: {
      return new WebAuthnVerification(libraries, queries, data);
    }
    case VerificationType.NewPasswordIdentity: {
      return new NewPasswordIdentityVerification(libraries, queries, data);
    }
    case VerificationType.OneTimeToken: {
      return new OneTimeTokenVerification(libraries, queries, data);
    }
  }
};
