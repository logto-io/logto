import { z } from 'zod';

import { OidcModelInstances } from '../db-entries/oidc-model-instance.js';
import { oidcSessionInstancePayloadGuard } from '../foundations/index.js';

import { jwtCustomizerUserInteractionContextGuard } from './logto-config/jwt-customizer.js';

export const userSessionSignInContextGuard = z
  .object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    botScore: z.string().optional(),
    botVerified: z.string().optional(),
  })
  .catchall(z.string());

export type UserSessionSignInContext = z.infer<typeof userSessionSignInContextGuard>;

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
