import { eventGuard, profileGuard } from '@logto/schemas';
import { z } from 'zod';

import { identifierPayloadTransformer } from './transformer.js';

export const interactionPayloadGuard = z.object({
  event: eventGuard,
  identifier: identifierPayloadTransformer.optional(),
  profile: profileGuard.optional(),
});

export type InteractionPayload = z.infer<typeof interactionPayloadGuard>;
