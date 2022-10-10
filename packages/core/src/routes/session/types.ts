import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export const passcodeTypeGuard = z.nativeEnum(PasscodeType);

export const methodGuard = z.enum(['email', 'sms']);

export type Method = z.infer<typeof methodGuard>;

export const operationGuard = z.enum(['send', 'verify']);

export type Operation = z.infer<typeof operationGuard>;

export type VerifiedIdentity = { email: string } | { phone: string };

export const verificationStorageGuard = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  flow: passcodeTypeGuard,
  expiresAt: z.string(),
});

export type VerificationStorage = z.infer<typeof verificationStorageGuard>;

export type VerificationResult<T = VerificationStorage> = { verification: T };

const smsSignInSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn),
  expiresAt: z.string(),
  phone: z.string(),
});

export type SmsSignInSessionStorage = z.infer<typeof smsSignInSessionStorageGuard>;

export const smsSignInSessionResultGuard = z.object({ verification: smsSignInSessionStorageGuard });

const emailSignInSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn),
  expiresAt: z.string(),
  email: z.string(),
});

export type EmailSignInSessionStorage = z.infer<typeof emailSignInSessionStorageGuard>;

export const emailSignInSessionResultGuard = z.object({
  verification: emailSignInSessionStorageGuard,
});

const smsRegisterSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Register),
  expiresAt: z.string(),
  phone: z.string(),
});

export type SmsRegisterSessionStorage = z.infer<typeof smsRegisterSessionStorageGuard>;

export const smsRegisterSessionResultGuard = z.object({
  verification: smsRegisterSessionStorageGuard,
});

const emailRegisterSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Register),
  expiresAt: z.string(),
  email: z.string(),
});

export type EmailRegisterSessionStorage = z.infer<typeof emailRegisterSessionStorageGuard>;

export const emailRegisterSessionResultGuard = z.object({
  verification: emailRegisterSessionStorageGuard,
});
