import { z } from 'zod';

import {
  type OneTimeTokenContext,
  oneTimeTokenContextGuard,
  SignInIdentifier,
} from '../../foundations/index.js';
import { type ToZodObject } from '../../utils/zod.js';
import { type InteractionIdentifier } from '../interactions.js';

import { VerificationType } from './verification-type.js';

export type OneTimeTokenVerificationRecordData = {
  id: string;
  type: VerificationType.OneTimeToken;
  identifier: InteractionIdentifier<SignInIdentifier.Email>;
  verified: boolean;
  oneTimeTokenContext?: OneTimeTokenContext;
};

export const oneTimeTokenVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.OneTimeToken),
  verified: z.boolean(),
  identifier: z.object({
    type: z.literal(SignInIdentifier.Email),
    value: z.string(),
  }),
  oneTimeTokenContext: oneTimeTokenContextGuard.optional(),
}) satisfies ToZodObject<OneTimeTokenVerificationRecordData>;
