import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { bindWebAuthnGuard, type BindWebAuthn } from '../interactions.js';

import { VerificationType } from './verification-type.js';

export type WebAuthnVerificationRecordData = {
  id: string;
  type: VerificationType.WebAuthn;
  /** UserId is required for verifying or binding new TOTP */
  userId: string;
  verified: boolean;
  /** The challenge generated for the WebAuthn registration */
  registrationChallenge?: string;
  /** The rpId used when generating the registration options */
  registrationRpId?: string;
  /** The challenge generated for the WebAuthn authentication */
  authenticationChallenge?: string;
  registrationInfo?: BindWebAuthn;
};

export const webAuthnVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.WebAuthn),
  userId: z.string(),
  verified: z.boolean(),
  registrationChallenge: z.string().optional(),
  registrationRpId: z.string().optional(),
  authenticationChallenge: z.string().optional(),
  registrationInfo: bindWebAuthnGuard.optional(),
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
