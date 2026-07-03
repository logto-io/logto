import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { type InteractionEvent } from '../../types/interactions.js';

const interactionEvents = new Set(['SignIn', 'Register', 'ForgotPassword']);
const oneTimeTokenInteractionEventGuard = z.custom<InteractionEvent>(
  (value) => typeof value === 'string' && interactionEvents.has(value)
);

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
  interactionEvent?: InteractionEvent;
};

export const oneTimeTokenContextGuard = z
  .object({
    jitOrganizationIds: z.string().array(),
    interactionEvent: oneTimeTokenInteractionEventGuard,
  })
  .partial() satisfies ToZodObject<OneTimeTokenContext>;

export enum OneTimeTokenStatus {
  Active = 'active',
  Consumed = 'consumed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export const oneTimeTokenStatusGuard = z.nativeEnum(OneTimeTokenStatus);
