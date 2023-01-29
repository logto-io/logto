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

// Admin console config
export const adminConsoleDataGuard = z.object({
  // Get started challenges
  demoChecked: z.boolean(),
  applicationCreated: z.boolean(),
  signInExperienceCustomized: z.boolean(),
  passwordlessConfigured: z.boolean(),
  socialSignInConfigured: z.boolean(),
  furtherReadingsChecked: z.boolean(),
});

export type AdminConsoleData = z.infer<typeof adminConsoleDataGuard>;

export enum AdminConsoleConfigKey {
  AdminConsole = 'adminConsole',
}

export type AdminConsoleConfigType = {
  [AdminConsoleConfigKey.AdminConsole]: AdminConsoleData;
};

export const adminConsoleConfigGuard: Readonly<{
  [key in AdminConsoleConfigKey]: ZodType<AdminConsoleConfigType[key]>;
}> = Object.freeze({
  [AdminConsoleConfigKey.AdminConsole]: adminConsoleDataGuard,
});

// Summary
export type LogtoConfigKey = AlterationStateKey | LogtoOidcConfigKey | AdminConsoleConfigKey;
export type LogtoConfigType = AlterationStateType | LogtoOidcConfigType | AdminConsoleConfigType;
export type LogtoConfigGuard = typeof alterationStateGuard &
  typeof logtoOidcConfigGuard &
  typeof adminConsoleConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(AlterationStateKey),
  ...Object.values(LogtoOidcConfigKey),
  ...Object.values(AdminConsoleConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...alterationStateGuard,
  ...logtoOidcConfigGuard,
  ...adminConsoleConfigGuard,
});
