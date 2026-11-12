import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { eventGuard, type InteractionEvent } from '../../types/interaction-event.js';

export type JitOrganizationRoleAssignment = {
  organizationId: string;
  organizationRoleIds: string[];
};

export type OneTimeTokenContext = {
  // Used for organization JIT provisioning.
  jitOrganizationIds?: string[];
  // Replaces the default JIT roles of the given organizations, which must be in `jitOrganizationIds`.
  jitOrganizationRoles?: JitOrganizationRoleAssignment[];
  // Restricts this one-time token to a specific interaction event.
  interactionEvent?: InteractionEvent;
};

export const oneTimeTokenContextGuard = z
  .object({
    jitOrganizationIds: z.string().array(),
    jitOrganizationRoles: z
      .object({ organizationId: z.string(), organizationRoleIds: z.string().array() })
      .array(),
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
