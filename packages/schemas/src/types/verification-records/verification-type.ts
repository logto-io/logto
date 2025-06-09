import { z } from 'zod';

export enum VerificationType {
  Password = 'Password',
  EmailVerificationCode = 'EmailVerificationCode',
  PhoneVerificationCode = 'PhoneVerificationCode',
  Social = 'Social',
  EnterpriseSso = 'EnterpriseSso',
  TOTP = 'Totp',
  WebAuthn = 'WebAuthn',
  BackupCode = 'BackupCode',
  NewPasswordIdentity = 'NewPasswordIdentity',
  OneTimeToken = 'OneTimeToken',
}

export const verificationTypeGuard = z.nativeEnum(VerificationType);
