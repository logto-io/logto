import { z } from 'zod';

export const flowTypeGuard = z.enum(['sign-in', 'register', 'forgot-password']);

export type FlowType = z.infer<typeof flowTypeGuard>;

export const viaGuard = z.enum(['email', 'sms']);

export type Via = z.infer<typeof viaGuard>;

export const operationGuard = z.enum(['send', 'verify']);

export type Operation = z.infer<typeof operationGuard>;

export type PasscodePayload = { email: string } | { phone: string };

export const verificationStorageGuard = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  flow: flowTypeGuard,
  expiresAt: z.string(),
});

export type VerificationStorage = z.infer<typeof verificationStorageGuard>;

export const verificationGuard = z.object({
  verification: verificationStorageGuard,
});

export type Verification = z.infer<typeof verificationGuard>;
