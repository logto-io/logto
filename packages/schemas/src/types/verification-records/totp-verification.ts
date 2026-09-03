import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

import { VerificationType } from './verification-type.js';

export type TotpVerificationRecordData = {
  id: string;
  type: VerificationType.TOTP;
  /** UserId is required for verifying or binding new TOTP */
  userId: string;
  secret?: string;
  verified: boolean;
};

export const totpVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.TOTP),
  userId: z.string(),
  secret: z.string().optional(),
  verified: z.boolean(),
}) satisfies ToZodObject<TotpVerificationRecordData>;

export type SanitizedTotpVerificationRecordData = Omit<TotpVerificationRecordData, 'secret'>;

export const sanitizedTotpVerificationRecordDataGuard = totpVerificationRecordDataGuard.omit({
  secret: true,
}) satisfies ToZodObject<SanitizedTotpVerificationRecordData>;
