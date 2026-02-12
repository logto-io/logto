import { z } from 'zod';

import { OidcModelInstances } from '../db-entries/oidc-model-instance.js';
import { oidcSessionInstancePayloadGuard } from '../foundations/index.js';

import { jwtCustomizerUserInteractionContextGuard } from './logto-config/jwt-customizer.js';

export const getUserSessionsResponseGuard = z.object({
  sessions: z.array(
    OidcModelInstances.guard.extend({
      payload: oidcSessionInstancePayloadGuard,
      lastSubmission: jwtCustomizerUserInteractionContextGuard.nullable(),
      clientId: z.string().nullable(),
      accountId: z.string().nullable(),
    })
  ),
});

export type GetUserSessionsResponse = z.infer<typeof getUserSessionsResponseGuard>;
