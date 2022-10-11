import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export const passcodeTypeGuard = z.nativeEnum(PasscodeType);

export const methodGuard = z.enum(['email', 'sms']);

export type Method = z.infer<typeof methodGuard>;

export const operationGuard = z.enum(['send', 'verify']);

export type Operation = z.infer<typeof operationGuard>;

export type VerifiedIdentity = { email: string } | { phone: string };

export const verificationSessionGuard = z.object({
  verification: z.object({}).catchall(z.unknown()),
});

export const smsSignInSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn),
  expiresAt: z.string(),
  phone: z.string(),
});

export const emailSignInSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.SignIn),
  expiresAt: z.string(),
  email: z.string(),
});

export const smsRegisterSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Register),
  expiresAt: z.string(),
  phone: z.string(),
});

export const emailRegisterSessionStorageGuard = z.object({
  flow: z.literal(PasscodeType.Register),
  expiresAt: z.string(),
  email: z.string(),
});

export const emailForgotPasswordSessionStorage = z.object({
  flow: z.literal(PasscodeType.ForgotPassword),
  expiresAt: z.string(),
  email: z.string(),
});

export const smsForgotPasswordSessionStorage = z.object({
  flow: z.literal(PasscodeType.ForgotPassword),
  expiresAt: z.string(),
  phone: z.string(),
});

export type VerificationStorage<F extends PasscodeType, M extends Method> = M extends 'email'
  ? {
      flow: F;
      expiresAt: string;
      email: string;
    }
  : {
      flow: F;
      expiresAt: string;
      phone: string;
    };

export type VerificationResult<
  T extends VerificationStorage<F, M>,
  F extends PasscodeType,
  M extends Method
> = {
  verification: T;
};
