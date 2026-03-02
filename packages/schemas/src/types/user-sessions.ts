import { z } from 'zod';

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

/**
 * Public session shape for session management APIs.
 *
 * We intentionally expose only fields needed by management/account-center session views and actions.
 * Internal OIDC storage fields (e.g. `tenantId`, `id`, `consumedAt`) are omitted on purpose.
 */
export const userExtendedSessionGuard = z.object({
  payload: oidcSessionInstancePayloadGuard,
  lastSubmission: jwtCustomizerUserInteractionContextGuard.nullable(),
  clientId: z.string().nullable(),
  accountId: z.string().nullable(),
  expiresAt: z.number(),
});

export const getUserSessionsResponseGuard = z.object({
  sessions: z.array(userExtendedSessionGuard),
});

/** Response type for `GET /users/:userId/sessions`. */
export type GetUserSessionsResponse = z.infer<typeof getUserSessionsResponseGuard>;

export const getUserSessionResponseGuard = userExtendedSessionGuard;

/** Response type for `GET /users/:userId/sessions/:sessionId`. */
export type GetUserSessionResponse = z.infer<typeof getUserSessionResponseGuard>;
