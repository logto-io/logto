import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export const passcodeTypeGuard = z.nativeEnum(PasscodeType);

export const methodGuard = z.enum(['email', 'sms']);

export type Method = z.infer<typeof methodGuard>;

export const operationGuard = z.enum(['send', 'verify']);

export type Operation = z.infer<typeof operationGuard>;

const smsSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn).or(z.literal(PasscodeType.Register)),
  expiresAt: z.string(),
  phone: z.string(),
});

export type SmsSessionStorage = z.infer<typeof smsSessionStorageGuard>;

export const smsSessionResultGuard = z.object({ verification: smsSessionStorageGuard });

const emailSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn).or(z.literal(PasscodeType.Register)),
  expiresAt: z.string(),
  email: z.string(),
});

export type EmailSessionStorage = z.infer<typeof emailSessionStorageGuard>;

export const emailSessionResultGuard = z.object({
  verification: emailSessionStorageGuard,
});

const forgotPasswordSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.ForgotPassword),
  expiresAt: z.string(),
  userId: z.string(),
});

export type ForgotPasswordSessionStorage = z.infer<typeof forgotPasswordSessionStorageGuard>;

export const forgotPasswordSessionResultGuard = z.object({
  verification: forgotPasswordSessionStorageGuard,
});

const continueEmailSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Continue),
  expiresAt: z.string(),
  email: z.string(),
});

export type ContinueEmailSessionStorage = z.infer<typeof continueEmailSessionStorageGuard>;

export const continueEmailSessionResultGuard = z.object({
  verification: continueEmailSessionStorageGuard,
});

const continueSmsSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Continue),
  expiresAt: z.string(),
  phone: z.string(),
});

export type ContinueSmsSessionStorage = z.infer<typeof continueSmsSessionStorageGuard>;

export const continueSmsSessionResultGuard = z.object({
  verification: continueSmsSessionStorageGuard,
});

export type VerificationStorage =
  | SmsSessionStorage
  | EmailSessionStorage
  | ForgotPasswordSessionStorage
  | ContinueEmailSessionStorage
  | ContinueSmsSessionStorage;

export type VerificationResult<T = VerificationStorage> = { verification: T };

export const continueSignInStorageGuard = z.object({
  userId: z.string(),
  expiresAt: z.string(),
});

export type ContinueSignInStorage = z.infer<typeof continueSignInStorageGuard>;
