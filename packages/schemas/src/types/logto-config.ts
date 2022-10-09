import { z } from 'zod';

// Alteration state
export const alterationStateGuard = z.object({
  timestamp: z.number(),
  updatedAt: z.string().optional(),
});

export type AlterationState = z.infer<typeof alterationStateGuard>;

// Logto OIDC config
export const logtoOidcConfigGuard = z.object({
  privateKeys: z.string().array().optional(),
  cookieKeys: z.string().array().optional(),
  /**
   * This interval helps to avoid concurrency issues when exchanging the rotating refresh token multiple times within a given timeframe.
   * During the leeway window (in seconds), the consumed refresh token will be considered as valid.
   * This is useful for distributed apps and serverless apps like Next.js, in which there is no shared memory.
   */
  refreshTokenReuseInterval: z.number().gte(3).optional(),
});

export type LogtoOidcConfig = z.infer<typeof logtoOidcConfigGuard>;

// Summary
export enum LogtoConfigKey {
  AlterationState = 'alterationState',
  OidcConfig = 'oidcConfig',
}

export const logtoConfigKeys = Object.values(LogtoConfigKey);

export const logtoConfigGuards = Object.freeze({
  [LogtoConfigKey.AlterationState]: alterationStateGuard,
  [LogtoConfigKey.OidcConfig]: logtoOidcConfigGuard,
} as const);
