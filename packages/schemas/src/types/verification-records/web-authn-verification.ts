import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { bindWebAuthnGuard, type BindWebAuthn } from '../interactions.js';

import { VerificationType } from './verification-type.js';

export type MfaWebAuthnVerificationRecordData = {
  id: string;
  type: VerificationType.MfaWebAuthn;
  userId: string;
  verified: boolean;
  /** The challenge generated for the WebAuthn registration */
  registrationChallenge?: string;
  /** The rpId used when generating the registration options */
  registrationRpId?: string;
  /** The challenge generated for the WebAuthn authentication */
  authenticationChallenge?: string;
  /** The rpId used when generating the authentication options */
  authenticationRpId?: string;
  registrationInfo?: BindWebAuthn;
};

export const mfaWebAuthnVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.MfaWebAuthn),
  userId: z.string(),
  verified: z.boolean(),
  registrationChallenge: z.string().optional(),
  registrationRpId: z.string().optional(),
  authenticationChallenge: z.string().optional(),
  authenticationRpId: z.string().optional(),
  registrationInfo: bindWebAuthnGuard.optional(),
}) satisfies ToZodObject<MfaWebAuthnVerificationRecordData>;

export type SanitizedMfaWebAuthnVerificationRecordData = Omit<
  MfaWebAuthnVerificationRecordData,
  'registrationInfo' | 'registrationChallenge' | 'registrationRpId' | 'authenticationChallenge'
>;

export const sanitizedMfaWebAuthnVerificationRecordDataGuard =
  mfaWebAuthnVerificationRecordDataGuard.omit({
    registrationInfo: true,
    registrationChallenge: true,
    registrationRpId: true,
    authenticationChallenge: true,
  }) satisfies ToZodObject<SanitizedMfaWebAuthnVerificationRecordData>;

export type PasskeySignInWebAuthnVerificationRecordData = {
  id: string;
  type: VerificationType.PasskeySignInWebAuthn;
  userId?: string;
  verified: boolean;
  /** The challenge generated for the WebAuthn registration */
  registrationChallenge?: string;
  /** The rpId used when generating the registration options */
  registrationRpId?: string;
  /** The challenge generated for the WebAuthn authentication */
  authenticationChallenge?: string;
  /** The rpId used when generating the authentication options */
  authenticationRpId?: string;
  registrationInfo?: BindWebAuthn;
};

export const passkeySignInWebAuthnVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.PasskeySignInWebAuthn),
  userId: z.string().optional(),
  verified: z.boolean(),
  registrationChallenge: z.string().optional(),
  registrationRpId: z.string().optional(),
  authenticationChallenge: z.string().optional(),
  authenticationRpId: z.string().optional(),
  registrationInfo: bindWebAuthnGuard.optional(),
}) satisfies ToZodObject<PasskeySignInWebAuthnVerificationRecordData>;

export type SanitizedPasskeySignInWebAuthnVerificationRecordData = Omit<
  PasskeySignInWebAuthnVerificationRecordData,
  | 'registrationInfo'
  | 'registrationChallenge'
  | 'registrationRpId'
  | 'authenticationChallenge'
  | 'authenticationRpId'
>;

export const sanitizedPasskeySignInWebAuthnVerificationRecordDataGuard =
  passkeySignInWebAuthnVerificationRecordDataGuard.omit({
    registrationInfo: true,
    registrationChallenge: true,
    registrationRpId: true,
    authenticationChallenge: true,
    authenticationRpId: true,
  }) satisfies ToZodObject<SanitizedPasskeySignInWebAuthnVerificationRecordData>;
