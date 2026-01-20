import { z } from 'zod';

export enum VerificationType {
  Password = 'Password',
  EmailVerificationCode = 'EmailVerificationCode',
  PhoneVerificationCode = 'PhoneVerificationCode',
  MfaEmailVerificationCode = 'MfaEmailVerificationCode',
  MfaPhoneVerificationCode = 'MfaPhoneVerificationCode',
  Social = 'Social',
  EnterpriseSso = 'EnterpriseSso',
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  SignInWebAuthn = 'SignInWebAuthn',
  BackupCode = 'BackupCode',
  NewPasswordIdentity = 'NewPasswordIdentity',
  OneTimeToken = 'OneTimeToken',
}

export const verificationTypeGuard = z.nativeEnum(VerificationType);
