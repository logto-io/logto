import { z } from 'zod';

import { OidcModelInstances } from '../db-entries/oidc-model-instance.js';
import { oidcSessionInstancePayloadGuard } from '../foundations/index.js';

import { jwtCustomizerUserInteractionContextGuard } from './logto-config/jwt-customizer.js';

export const userExtendedSessionGuard = OidcModelInstances.guard.extend({
  payload: oidcSessionInstancePayloadGuard,
  lastSubmission: jwtCustomizerUserInteractionContextGuard.nullable(),
  clientId: z.string().nullable(),
  accountId: z.string().nullable(),
});

export const getUserSessionsResponseGuard = z.object({
  sessions: z.array(userExtendedSessionGuard),
});

export type GetUserSessionsResponse = z.infer<typeof getUserSessionsResponseGuard>;

export const getUserSessionResponseGuard = userExtendedSessionGuard;

export type GetUserSessionResponse = z.infer<typeof getUserSessionResponseGuard>;
