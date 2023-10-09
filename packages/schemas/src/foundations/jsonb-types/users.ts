import { z } from 'zod';

import { MfaFactor } from './sign-in-experience.js';

export const roleNamesGuard = z.string().array();

const identityGuard = z.object({
  userId: z.string(),
  details: z.object({}).optional(), // Connector's userinfo details, schemaless
});
export const identitiesGuard = z.record(identityGuard);

export type Identity = z.infer<typeof identityGuard>;
export type Identities = z.infer<typeof identitiesGuard>;

export const baseMfaVerification = {
  id: z.string(),
  createdAt: z.string(),
};

export const mfaVerificationTotp = z.object({
  type: z.literal(MfaFactor.TOTP),
  ...baseMfaVerification,
  key: z.string(),
});

export type MfaVerificationTotp = z.infer<typeof mfaVerificationTotp>;

export const webAuthnTransportGuard = z.enum([
  'usb',
  'nfc',
  'ble',
  'internal',
  'cable',
  'hybrid',
  'smart-card',
]);

export const mfaVerificationWebAuthn = z.object({
  type: z.literal(MfaFactor.WebAuthn),
  ...baseMfaVerification,
  credentialId: z.string(),
  publicKey: z.string(),
  transports: webAuthnTransportGuard.array().optional(),
  counter: z.number(),
  agent: z.string(),
});

export type MfaVerificationWebAuthn = z.infer<typeof mfaVerificationWebAuthn>;

export const mfaVerificationBackupCode = z.object({
  type: z.literal(MfaFactor.BackupCode),
  ...baseMfaVerification,
  code: z.string(),
  usedAt: z.string().optional(),
});

export type MfaVerificationBackupCode = z.infer<typeof mfaVerificationBackupCode>;

export const mfaVerificationGuard = z.discriminatedUnion('type', [
  mfaVerificationTotp,
  mfaVerificationWebAuthn,
  mfaVerificationBackupCode,
]);

export type MfaVerification = z.infer<typeof mfaVerificationGuard>;

export const mfaVerificationsGuard = mfaVerificationGuard.array();

export type MfaVerifications = z.infer<typeof mfaVerificationsGuard>;
