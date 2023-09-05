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

// Storage provider
export enum StorageProvider {
  AzureStorage = 'AzureStorage',
  S3Storage = 'S3Storage',
}

const basicConfig = {
  publicUrl: z.string().optional(),
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
    bucket: z.string(),
    accessKeyId: z.string(),
    accessSecretKey: z.string(),
    ...basicConfig,
  }),
]);

export type StorageProviderData = z.infer<typeof storageProviderDataGuard>;

export enum StorageProviderKey {
  StorageProvider = 'storageProvider',
}

export type StorageProviderType = {
  [StorageProviderKey.StorageProvider]: StorageProviderData;
};

export const storageProviderGuard: Readonly<{
  [key in StorageProviderKey]: ZodType<StorageProviderType[key]>;
}> = Object.freeze({
  [StorageProviderKey.StorageProvider]: storageProviderDataGuard,
});

// Email service provider
export enum EmailServiceProvider {
  SendGrid = 'SendGrid',
}

export const sendgridEmailServiceConfigGuard = z.object({
  provider: z.literal(EmailServiceProvider.SendGrid),
  apiKey: z.string(),
  templateId: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
});

export type SendgridEmailServiceConfig = z.infer<typeof sendgridEmailServiceConfigGuard>;

export const emailServiceConfigGuard = z.discriminatedUnion('provider', [
  sendgridEmailServiceConfigGuard,
]);

export type EmailServiceConfig = z.infer<typeof emailServiceConfigGuard>;

export enum EmailServiceProviderKey {
  EmailServiceProvider = 'emailServiceProvider',
}

export type EmailServiceProviderType = {
  [EmailServiceProviderKey.EmailServiceProvider]: EmailServiceConfig;
};

export const emailServiceProviderGuard: Readonly<{
  [key in EmailServiceProviderKey]: ZodType<EmailServiceProviderType[key]>;
}> = Object.freeze({
  [EmailServiceProviderKey.EmailServiceProvider]: emailServiceConfigGuard,
});

// Demo social connectors
export enum DemoSocialProvider {
  Google = 'google',
  GitHub = 'github',
  Discord = 'discord',
}

export const demoSocialDataGuard = z
  .object({
    name: z.string(),
    logo: z.string(),
    logoDark: z.string(),
    provider: z.nativeEnum(DemoSocialProvider),
    clientId: z.string(),
  })
  .array();

export type DemoSocialData = z.infer<typeof demoSocialDataGuard>;

export enum DemoSocialKey {
  DemoSocial = 'demoSocial',
}

export type DemoSocialType = {
  [DemoSocialKey.DemoSocial]: DemoSocialData;
};

export const demoSocialGuard: Readonly<{
  [key in DemoSocialKey]: ZodType<DemoSocialType[key]>;
}> = Object.freeze({
  [DemoSocialKey.DemoSocial]: demoSocialDataGuard,
});

// Cloudflare Hostnames
export const hostnameProviderDataGuard = z.object({
  zoneId: z.string(),
  apiToken: z.string(), // Requires zone permission for "SSL and Certificates Edit"
});

export type HostnameProviderData = z.infer<typeof hostnameProviderDataGuard>;

export enum CloudflareKey {
  HostnameProvider = 'cloudflareHostnameProvider',
}

export type CloudflareType = {
  [CloudflareKey.HostnameProvider]: HostnameProviderData;
};

export const cloudflareGuard: Readonly<{
  [key in CloudflareKey]: ZodType<CloudflareType[key]>;
}> = Object.freeze({
  [CloudflareKey.HostnameProvider]: hostnameProviderDataGuard,
});

// Summary
export type SystemKey =
  | AlterationStateKey
  | StorageProviderKey
  | DemoSocialKey
  | CloudflareKey
  | EmailServiceProviderKey;
export type SystemType =
  | AlterationStateType
  | StorageProviderType
  | DemoSocialType
  | CloudflareType
  | EmailServiceProviderType;
export type SystemGuard = typeof alterationStateGuard &
  typeof storageProviderGuard &
  typeof demoSocialGuard &
  typeof cloudflareGuard &
  typeof emailServiceProviderGuard;

export const systemKeys: readonly SystemKey[] = Object.freeze([
  ...Object.values(AlterationStateKey),
  ...Object.values(StorageProviderKey),
  ...Object.values(DemoSocialKey),
  ...Object.values(CloudflareKey),
  ...Object.values(EmailServiceProviderKey),
]);

export const systemGuards: SystemGuard = Object.freeze({
  ...alterationStateGuard,
  ...storageProviderGuard,
  ...demoSocialGuard,
  ...cloudflareGuard,
  ...emailServiceProviderGuard,
});
