import { eventGuard, profileGuard, identifierGuard } from '@logto/schemas';
import { z } from 'zod';

export const interactionPayloadGuard = z.object({
  event: eventGuard.optional(),
  identifier: identifierGuard.optional(),
  profile: profileGuard.optional(),
});

export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;
export type IdentifierPayload = z.infer<typeof identifierGuard>;
