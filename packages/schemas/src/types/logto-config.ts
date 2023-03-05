import type { ZodType } from 'zod';
import { z } from 'zod';

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
  livePreviewChecked: z.boolean(),
  applicationCreated: z.boolean(),
  signInExperienceCustomized: z.boolean(),
  passwordlessConfigured: z.boolean(),
  selfHostingChecked: z.boolean(),
  communityChecked: z.boolean(),
  m2mApplicationCreated: z.boolean(),
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

export enum StorageProviderConfigKey {
  StorageProvider = 'storageProvider',
}

export enum StorageProvider {
  AzureStorage = 'AzureStorage',
  S3Storage = 'S3Storage',
}

const basicConfig = {
  publicUrl: z.string(),
};

export const storageProviderDataGuard = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal(StorageProvider.AzureStorage),
    connectionString: z.string(),
    container: z.string(),
    ...basicConfig,
  }),
  z.object({
    provider: z.literal(StorageProvider.S3Storage),
    endpoint: z.string(),
    accessKeyId: z.string(),
    accessSecretKey: z.string(),
    ...basicConfig,
  }),
]);

export type StorageProviderData = z.infer<typeof storageProviderDataGuard>;

export type StorageProviderConfigType = {
  [StorageProviderConfigKey.StorageProvider]: StorageProviderData;
};

export const storageProviderConfigGuard: Readonly<{
  [key in StorageProviderConfigKey]: ZodType<StorageProviderConfigType[key]>;
}> = Object.freeze({
  [StorageProviderConfigKey.StorageProvider]: storageProviderDataGuard,
});

// Summary
export type LogtoConfigKey = LogtoOidcConfigKey | AdminConsoleConfigKey | StorageProviderConfigKey;
export type LogtoConfigType =
  | LogtoOidcConfigType
  | AdminConsoleConfigType
  | StorageProviderConfigType;
export type LogtoConfigGuard = typeof logtoOidcConfigGuard &
  typeof adminConsoleConfigGuard &
  typeof storageProviderConfigGuard;

export const logtoConfigKeys: readonly LogtoConfigKey[] = Object.freeze([
  ...Object.values(LogtoOidcConfigKey),
  ...Object.values(AdminConsoleConfigKey),
  ...Object.values(StorageProviderConfigKey),
]);

export const logtoConfigGuards: LogtoConfigGuard = Object.freeze({
  ...logtoOidcConfigGuard,
  ...adminConsoleConfigGuard,
  ...storageProviderConfigGuard,
});
