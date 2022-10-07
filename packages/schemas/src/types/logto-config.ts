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
