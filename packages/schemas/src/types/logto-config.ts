import type { ZodType } from 'zod';
import { z } from 'zod';

// Alteration state
export enum AlterationStateKey {
  AlterationState = 'alterationState',
}

export type AlterationState = { timestamp: number; updatedAt?: string };

export type AlterationStateType = {
  [AlterationStateKey.AlterationState]: AlterationState;
};

export const alterationStateGuard: Readonly<{
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
}

export type LogtoOidcConfigType = {
  [LogtoOidcConfigKey.PrivateKeys]: string[];
  [LogtoOidcConfigKey.CookieKeys]: string[];
};

export const logtoOidcConfigGuard: Readonly<{
  [key in LogtoOidcConfigKey]: ZodType<LogtoOidcConfigType[key]>;
}> = Object.freeze({
  [LogtoOidcConfigKey.PrivateKeys]: z.string().array(),
  [LogtoOidcConfigKey.CookieKeys]: z.string().array(),
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
