import { jsonObjectGuard } from '@logto/connector-kit';
import { z } from 'zod';

import { MfaFactor } from './sign-in-experience.js';

export type UserProfile = Partial<{
  familyName: string;
  givenName: string;
  middleName: string;
  nickname: string;
  preferredUsername: string;
  profile: string;
  website: string;
  gender: string;
  birthdate: string;
  zoneinfo: string;
  locale: string;
  address: Partial<{
    formatted: string;
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  }>;
}>;

export const addressGuard = z.object({
  formatted: z.string().optional(),
  streetAddress: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const userProfileGuard = (
  z.object({
    familyName: z.string(),
    givenName: z.string(),
    middleName: z.string(),
    nickname: z.string(),
    preferredUsername: z.string(),
    profile: z.string(),
    website: z.string(),
    gender: z.string(),
    birthdate: z.string(),
    zoneinfo: z.string(),
    locale: z.string(),
    address: addressGuard,
  }) satisfies z.ZodType<Required<UserProfile>>
).partial();

export const userProfileKeys = Object.freeze(userProfileGuard.keyof().options);

export const userProfileAddressKeys = Object.freeze(addressGuard.keyof().options);

export const roleNamesGuard = z.string().array();

export const identityGuard = z.object({
  userId: z.string(),
  details: jsonObjectGuard.optional(), // Connector's userinfo details, schemaless
});
export const identitiesGuard = z.record(identityGuard);

export type Identity = z.infer<typeof identityGuard>;
export type Identities = z.infer<typeof identitiesGuard>;

export const baseMfaVerification = {
  id: z.string(),
  createdAt: z.string(),
  lastUsedAt: z.string().optional(),
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
  name: z.string().optional(),
});

export type MfaVerificationWebAuthn = z.infer<typeof mfaVerificationWebAuthn>;

export const mfaVerificationBackupCode = z.object({
  type: z.literal(MfaFactor.BackupCode),
  ...baseMfaVerification,
  codes: z.object({ code: z.string(), usedAt: z.string().optional() }).array(),
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
