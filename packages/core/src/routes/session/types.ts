import { PasscodeType } from '@logto/schemas';
import { z } from 'zod';

export const passcodeTypeGuard = z.nativeEnum(PasscodeType);

export const methodGuard = z.enum(['email', 'sms']);

export type Method = z.infer<typeof methodGuard>;

export const operationGuard = z.enum(['send', 'verify']);

export type Operation = z.infer<typeof operationGuard>;

export type PasscodePayload = { email: string } | { phone: string };

export const verificationStorageGuard = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  flow: passcodeTypeGuard,
  expiresAt: z.string(),
});

export type VerificationStorage = z.infer<typeof verificationStorageGuard>;
