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
}

export const verificationTypeGuard = z.nativeEnum(VerificationType);
