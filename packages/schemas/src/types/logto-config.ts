import type { ZodType } from 'zod';
import { z } from 'zod';

/* --- Logto OIDC configs --- */
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

/* --- Logto tenant configs --- */
export const adminConsoleDataGuard = z.object({
  // Get started challenges
  livePreviewChecked: z.boolean(),
  applicationCreated: z.boolean(),
  signInExperienceCustomized: z.boolean(),
  passwordlessConfigured: z.boolean(),
  communityChecked: z.boolean(),
  furtherReadingsChecked: z.boolean(),
  roleCreated: z.boolean(),
  m2mApplicationCreated: z.boolean(),
});

export type AdminConsoleData = z.infer<typeof adminConsoleDataGuard>;

export enum LogtoTenantConfigKey {
  AdminConsole = 'adminConsole',
  /** The URL to redirect when session not found in Sign-in Experience. */
  SessionNotFoundRedirectUrl = 'sessionNotFoundRedirectUrl',
}
export type LogtoTenantConfigType = {
  [LogtoTenantConfigKey.AdminConsole]: AdminConsoleData;
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: { url: string };
};

export const logtoTenantConfigGuard: Readonly<{
  [key in LogtoTenantConfigKey]: ZodType<LogtoTenantConfigType[key]>;
}> = Object.freeze({
  [LogtoTenantConfigKey.AdminConsole]: adminConsoleDataGuard,
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: z.object({ url: z.string() }),
});

/* --- Summary --- */
export type LogtoConfigKey = LogtoOidcConfigKey | LogtoTenantConfigKey;
export type LogtoConfigType = LogtoOidcConfigType | LogtoTenantConfigType;
export type LogtoConfigGuard = typeof logtoOidcConfigGuard & typeof logtoTenantConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(LogtoOidcConfigKey),
  ...Object.values(LogtoTenantConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...logtoOidcConfigGuard,
  ...logtoTenantConfigGuard,
});
