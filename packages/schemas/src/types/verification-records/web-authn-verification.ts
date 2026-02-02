import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { bindWebAuthnGuard, type BindWebAuthn } from '../interactions.js';

import { VerificationType } from './verification-type.js';

type BaseWebAuthnVerificationRecordData = {
  id: string;
  verified: boolean;
  /** The challenge generated for the WebAuthn registration */
  registrationChallenge?: string;
  /** The rpId used when generating the registration options */
  registrationRpId?: string;
  /** The challenge generated for the WebAuthn authentication */
  authenticationChallenge?: string;
  registrationInfo?: BindWebAuthn;
};

const baseWebAuthnVerificationRecordDataGuard = z.object({
  id: z.string(),
  verified: z.boolean(),
  registrationChallenge: z.string().optional(),
  registrationRpId: z.string().optional(),
  authenticationChallenge: z.string().optional(),
  registrationInfo: bindWebAuthnGuard.optional(),
}) satisfies ToZodObject<BaseWebAuthnVerificationRecordData>;

export type WebAuthnVerificationRecordData = BaseWebAuthnVerificationRecordData & {
  type: VerificationType.WebAuthn;
  userId: string;
};

export const webAuthnVerificationRecordDataGuard = baseWebAuthnVerificationRecordDataGuard.extend({
  type: z.literal(VerificationType.WebAuthn),
  userId: z.string(),
}) satisfies ToZodObject<WebAuthnVerificationRecordData>;

export type SanitizedWebAuthnVerificationRecordData = Omit<
  WebAuthnVerificationRecordData,
  'registrationInfo' | 'registrationChallenge' | 'registrationRpId' | 'authenticationChallenge'
>;

export const sanitizedWebAuthnVerificationRecordDataGuard =
  webAuthnVerificationRecordDataGuard.omit({
    registrationInfo: true,
    registrationChallenge: true,
    registrationRpId: true,
    authenticationChallenge: true,
  }) satisfies ToZodObject<SanitizedWebAuthnVerificationRecordData>;

export type SignInWebAuthnVerificationRecordData = BaseWebAuthnVerificationRecordData & {
  type: VerificationType.SignInWebAuthn;
  userId?: string;
  /** The rpId used when generating the authentication options */
  authenticationRpId?: string;
};

export const signInWebAuthnVerificationRecordDataGuard =
  baseWebAuthnVerificationRecordDataGuard.extend({
    type: z.literal(VerificationType.SignInWebAuthn),
    userId: z.string().optional(),
    authenticationRpId: z.string().optional(),
  }) satisfies ToZodObject<SignInWebAuthnVerificationRecordData>;

export type SanitizedSignInWebAuthnVerificationRecordData = Omit<
  SignInWebAuthnVerificationRecordData,
  | 'registrationInfo'
  | 'registrationChallenge'
  | 'registrationRpId'
  | 'authenticationChallenge'
  | 'authenticationRpId'
>;

export const sanitizedSignInWebAuthnVerificationRecordDataGuard =
  signInWebAuthnVerificationRecordDataGuard.omit({
    registrationInfo: true,
    registrationChallenge: true,
    registrationRpId: true,
    authenticationChallenge: true,
    authenticationRpId: true,
  }) satisfies ToZodObject<SanitizedSignInWebAuthnVerificationRecordData>;
