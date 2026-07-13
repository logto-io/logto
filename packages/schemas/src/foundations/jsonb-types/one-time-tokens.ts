import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { eventGuard, type InteractionEvent } from '../../types/interaction-event.js';

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
  // Restricts this one-time token to a specific interaction event.
  interactionEvent?: InteractionEvent;
};

export const oneTimeTokenContextGuard = z
  .object({
    jitOrganizationIds: z.string().array(),
    interactionEvent: eventGuard,
  })
  .partial() satisfies ToZodObject<OneTimeTokenContext>;

export enum OneTimeTokenStatus {
  Active = 'active',
  Consumed = 'consumed',
  Revoked = 'revoked',
  Expired = 'expired',
}

export const oneTimeTokenStatusGuard = z.nativeEnum(OneTimeTokenStatus);
