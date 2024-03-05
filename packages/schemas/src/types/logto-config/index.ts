import type { ZodType } from 'zod';
import { z } from 'zod';

import { jsonObjectGuard } from '../../foundations/index.js';

import { accessTokenGuard, clientCredentialsGuard } from './oidc-provider.js';

export * from './oidc-provider.js';

/**
 * Logto OIDC signing key types, used mainly in REST API routes.
 */
export enum LogtoOidcConfigKeyType {
  PrivateKeys = 'private-keys',
  CookieKeys = 'cookie-keys',
}

/**
 * Value maps to config key names in `logto_configs` table. Used mainly in DB SQL related scenarios.
 */
export enum LogtoOidcConfigKey {
  PrivateKeys = 'oidc.privateKeys',
  CookieKeys = 'oidc.cookieKeys',
}

/**
 * Logto supported signing key algorithms for OIDC private keys that sign JWT tokens.
 */
export enum SupportedSigningKeyAlgorithm {
  RSA = 'RSA',
  EC = 'EC',
}

export const oidcConfigKeyGuard = z.object({
  id: z.string(),
  value: z.string(),
  createdAt: z.number(),
});

export type OidcConfigKey = z.infer<typeof oidcConfigKeyGuard>;

export type LogtoOidcConfigType = {
  [LogtoOidcConfigKey.PrivateKeys]: OidcConfigKey[];
  [LogtoOidcConfigKey.CookieKeys]: OidcConfigKey[];
};

export const logtoOidcConfigGuard: Readonly<{
  [key in LogtoOidcConfigKey]: ZodType<LogtoOidcConfigType[key]>;
}> = Object.freeze({
  [LogtoOidcConfigKey.PrivateKeys]: oidcConfigKeyGuard.array(),
  [LogtoOidcConfigKey.CookieKeys]: oidcConfigKeyGuard.array(),
});

/**
 * Logto JWT customizer token types, used in REST API routes.
 */
export enum LogtoJwtTokenKeyType {
  AccessToken = 'access-token',
  ClientCredentials = 'client-credentials',
}

export enum LogtoJwtTokenKey {
  AccessToken = 'jwt.accessToken',
  ClientCredentials = 'jwt.clientCredentials',
}

const jwtCustomizerGuard = z
  .object({
    script: z.string(),
    envVars: z.record(z.string()),
    contextSample: jsonObjectGuard,
  })
  .partial();

export const jwtCustomizerAccessTokenGuard = jwtCustomizerGuard.extend({
  // Use partial token guard since users customization may not rely on all fields.
  tokenSample: accessTokenGuard.partial().optional(),
});

export type JwtCustomizerAccessToken = z.infer<typeof jwtCustomizerAccessTokenGuard>;

export const jwtCustomizerClientCredentialsGuard = jwtCustomizerGuard.extend({
  // Use partial token guard since users customization may not rely on all fields.
  tokenSample: clientCredentialsGuard.partial().optional(),
});

export type JwtCustomizerClientCredentials = z.infer<typeof jwtCustomizerClientCredentialsGuard>;

export type JwtCustomizerType = {
  [LogtoJwtTokenKey.AccessToken]: JwtCustomizerAccessToken;
  [LogtoJwtTokenKey.ClientCredentials]: JwtCustomizerClientCredentials;
};

export const jwtCustomizerConfigGuard: Readonly<{
  [key in LogtoJwtTokenKey]: ZodType<JwtCustomizerType[key]>;
}> = Object.freeze({
  [LogtoJwtTokenKey.AccessToken]: jwtCustomizerAccessTokenGuard,
  [LogtoJwtTokenKey.ClientCredentials]: jwtCustomizerClientCredentialsGuard,
});

/* --- Logto tenant configs --- */
export const adminConsoleDataGuard = z.object({
  signInExperienceCustomized: z.boolean(),
  organizationCreated: z.boolean(),
  developmentTenantMigrationNotification: z
    .object({
      isPaidTenant: z.boolean(),
      /**
       * Tag is used to store the original tenant tag before dev tenant migration.
       * This field is only used for DB rollback and because the `TenantTag` may change, so we don't guard it as the `TenantTag` type.
       */
      tag: z.string(),
      readAt: z.number().optional(),
    })
    .optional(),
  checkedChargeNotification: z
    .object({
      token: z.boolean().optional(),
      apiResource: z.boolean().optional(),
      machineToMachineApp: z.boolean().optional(),
    })
    .optional(),
});

export type AdminConsoleData = z.infer<typeof adminConsoleDataGuard>;

/* --- Logto tenant cloud connection config --- */
export const cloudConnectionDataGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
  resource: z.string(),
});

export type CloudConnectionData = z.infer<typeof cloudConnectionDataGuard>;

export enum LogtoTenantConfigKey {
  AdminConsole = 'adminConsole',
  CloudConnection = 'cloudConnection',
  /** The URL to redirect when session not found in Sign-in Experience. */
  SessionNotFoundRedirectUrl = 'sessionNotFoundRedirectUrl',
}
export type LogtoTenantConfigType = {
  [LogtoTenantConfigKey.AdminConsole]: AdminConsoleData;
  [LogtoTenantConfigKey.CloudConnection]: CloudConnectionData;
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: { url: string };
};

export const logtoTenantConfigGuard: Readonly<{
  [key in LogtoTenantConfigKey]: ZodType<LogtoTenantConfigType[key]>;
}> = Object.freeze({
  [LogtoTenantConfigKey.AdminConsole]: adminConsoleDataGuard,
  [LogtoTenantConfigKey.CloudConnection]: cloudConnectionDataGuard,
  [LogtoTenantConfigKey.SessionNotFoundRedirectUrl]: z.object({ url: z.string() }),
});

/* --- Summary --- */
export type LogtoConfigKey = LogtoOidcConfigKey | LogtoJwtTokenKey | LogtoTenantConfigKey;
export type LogtoConfigType = LogtoOidcConfigType | JwtCustomizerType | LogtoTenantConfigType;
export type LogtoConfigGuard = typeof logtoOidcConfigGuard &
  typeof jwtCustomizerConfigGuard &
  typeof logtoTenantConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(LogtoOidcConfigKey),
  ...Object.values(LogtoJwtTokenKey),
  ...Object.values(LogtoTenantConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...logtoOidcConfigGuard,
  ...jwtCustomizerConfigGuard,
  ...logtoTenantConfigGuard,
});

export const oidcConfigKeysResponseGuard = oidcConfigKeyGuard
  .omit({ value: true })
  .merge(z.object({ signingKeyAlgorithm: z.nativeEnum(SupportedSigningKeyAlgorithm).optional() }));

export type OidcConfigKeysResponse = z.infer<typeof oidcConfigKeysResponseGuard>;
