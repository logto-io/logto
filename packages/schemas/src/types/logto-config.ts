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
export const logtoConfigGuards = Object.freeze({
  alterationState: alterationStateGuard,
  oidcConfig: logtoOidcConfigGuard,
} as const);

export type LogtoConfigKey = keyof typeof logtoConfigGuards;

// `as` is intended since we'd like to keep `logtoConfigGuards` as the SSOT of keys
// eslint-disable-next-line no-restricted-syntax
export const logtoConfigKeys = Object.keys(logtoConfigGuards) as LogtoConfigKey[];
