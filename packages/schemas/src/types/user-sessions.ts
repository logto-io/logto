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

export enum SessionGrantRevokeTarget {
  All = 'all',
  FirstParty = 'firstParty',
}

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

/**
 * Account-API-specific extension of `userExtendedSessionGuard`.
 *
 * Adds `isCurrent` so a caller that has its own OIDC session uid (i.e. the Account API)
 * can mark which entry in the list is the session backing the request. Kept separate
 * from `userExtendedSessionGuard` because the management/admin endpoints have no
 * "current session" concept and shouldn't surface this field in their contracts.
 */
export const accountUserExtendedSessionGuard = userExtendedSessionGuard.extend({
  /**
   * `true` for the entry whose `payload.uid` matches the calling session, `false` for
   * the others. At most one entry is `true` per response — zero when the caller has
   * already revoked its own session and the access token has not yet expired.
   */
  isCurrent: z.boolean(),
});

export const getAccountUserSessionsResponseGuard = z.object({
  sessions: z.array(accountUserExtendedSessionGuard),
});

/** Response type for `GET /api/my-account/sessions`. */
export type GetAccountUserSessionsResponse = z.infer<typeof getAccountUserSessionsResponseGuard>;

export const userApplicationGrantPayloadGuard = z
  .object({
    /** Expiration time of the grant in seconds since the epoch */
    exp: z.number(),
    /** Issued at time of the grant in seconds since the epoch */
    iat: z.number(),
    jti: z.string(),
    kind: z.literal('Grant'),
    clientId: z.string(),
    accountId: z.string(),
  })
  .catchall(z.unknown());

export type UserApplicationGrantPayload = z.infer<typeof userApplicationGrantPayloadGuard>;

export const userApplicationGrantGuard = z.object({
  id: z.string(),
  payload: userApplicationGrantPayloadGuard,
  expiresAt: z.number(),
});

export type UserApplicationGrant = z.infer<typeof userApplicationGrantGuard>;

export const getUserApplicationGrantsResponseGuard = z.object({
  grants: z.array(userApplicationGrantGuard),
});

export type GetUserApplicationGrantsResponse = z.infer<
  typeof getUserApplicationGrantsResponseGuard
>;
