import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { verificationIdentifierGuard, type VerificationIdentifier } from '../interactions.js';

import { VerificationType } from './verification-type.js';

export type PasswordVerificationRecordData = {
  id: string;
  type: VerificationType.Password;
  identifier: VerificationIdentifier;
  verified: boolean;
};

export const passwordVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.Password),
  identifier: verificationIdentifierGuard,
  verified: z.boolean(),
}) satisfies ToZodObject<PasswordVerificationRecordData>;
