import type Provider from 'oidc-provider';
import { z } from 'zod';

import { passwordIdentifierGuard, VerificationType } from './verifications/index.js';

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

const passwordSignInPayload = z.object({
  identifier: passwordIdentifierGuard,
  verification: z.object({
    type: z.literal(VerificationType.Password),
    value: z.string(),
  }),
});

export const signInPayloadGuard = passwordSignInPayload;
