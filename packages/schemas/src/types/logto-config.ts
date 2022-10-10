import { z, ZodType } from 'zod';

// Alteration state
export enum AlterationStateKey {
  AlterationState = 'alterationState',
}

export type AlterationState = { timestamp: number; updatedAt?: string };

export type AlterationStateType = {
  [AlterationStateKey.AlterationState]: AlterationState;
};

const alterationStateGuard: Readonly<{
  [key in AlterationStateKey]: ZodType<AlterationStateType[key]>;
}> = Object.freeze({
  [AlterationStateKey.AlterationState]: z.object({
    timestamp: z.number(),
    updatedAt: z.string().optional(),
  }),
});

// Logto OIDC config
export enum LogtoOidcConfigKey {
  PrivateKeys = 'oidc.privateKeys',
  CookieKeys = 'oidc.cookieKeys',
  RefreshTokenReuseInterval = 'oidc.refreshTokenReuseInterval',
}

export type LogtoOidcConfigType = {
  [LogtoOidcConfigKey.PrivateKeys]: string[];
  [LogtoOidcConfigKey.CookieKeys]: string[];
  [LogtoOidcConfigKey.RefreshTokenReuseInterval]: number;
};

const logtoOidcConfigGuard: Readonly<{
  [key in LogtoOidcConfigKey]: ZodType<LogtoOidcConfigType[key]>;
}> = Object.freeze({
  [LogtoOidcConfigKey.PrivateKeys]: z.string().array(),
  [LogtoOidcConfigKey.CookieKeys]: z.string().array(),
  /**
   * This interval helps to avoid concurrency issues when exchanging the rotating refresh token multiple times within a given timeframe.
   * During the leeway window (in seconds), the consumed refresh token will be considered as valid.
   * This is useful for distributed apps and serverless apps like Next.js, in which there is no shared memory.
   */
  [LogtoOidcConfigKey.RefreshTokenReuseInterval]: z.number().gte(3),
});

// Summary
export type LogtoConfigKey = AlterationStateKey | LogtoOidcConfigKey;
export type LogtoConfigType = AlterationStateType | LogtoOidcConfigType;
export type LogtoConfigGuard = typeof alterationStateGuard & typeof logtoOidcConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(AlterationStateKey),
  ...Object.values(LogtoOidcConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...alterationStateGuard,
  ...logtoOidcConfigGuard,
});
