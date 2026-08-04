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
  GoogleStorage = 'GoogleStorage',
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
    endpoint: z.string().optional(),
    region: z.string().optional(),
    bucket: z.string(),
    forcePathStyle: z.boolean().optional(),
    accessKeyId: z.string(),
    accessSecretKey: z.string(),
    ...basicConfig,
  }),
  z.object({
    provider: z.literal(StorageProvider.GoogleStorage),
    projectId: z.string(),
    keyFilename: z.string(),
    bucketName: z.string(),
    ...basicConfig,
  }),
]);

export type StorageProviderData = z.infer<typeof storageProviderDataGuard>;

export enum StorageProviderKey {
  StorageProvider = 'storageProvider',
  ExperienceBlobsProvider = 'experienceBlobsProvider',
  ExperienceZipsProvider = 'experienceZipsProvider',
}

export type StorageProviderType = {
  [StorageProviderKey.StorageProvider]: StorageProviderData;
  [StorageProviderKey.ExperienceBlobsProvider]: StorageProviderData;
  [StorageProviderKey.ExperienceZipsProvider]: StorageProviderData;
};

export const storageProviderGuard: Readonly<{
  [key in StorageProviderKey]: ZodType<StorageProviderType[key]>;
}> = Object.freeze({
  [StorageProviderKey.StorageProvider]: storageProviderDataGuard,
  [StorageProviderKey.ExperienceBlobsProvider]: storageProviderDataGuard,
  [StorageProviderKey.ExperienceZipsProvider]: storageProviderDataGuard,
});

// Email service provider
export enum EmailServiceProvider {
  SendGrid = 'SendGrid',
  Cloudflare = 'Cloudflare',
  Resend = 'Resend',
}

export const sendgridEmailServiceConfigGuard = z.object({
  provider: z.literal(EmailServiceProvider.SendGrid),
  apiKey: z.string(),
  templateId: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
});

export type SendgridEmailServiceConfig = z.infer<typeof sendgridEmailServiceConfigGuard>;

export const cloudflareEmailServiceConfigGuard = z.object({
  provider: z.literal(EmailServiceProvider.Cloudflare),
  apiKey: z.string(),
  accountId: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
});

export type CloudflareEmailServiceConfig = z.infer<typeof cloudflareEmailServiceConfigGuard>;

export const resendEmailServiceConfigGuard = z.object({
  provider: z.literal(EmailServiceProvider.Resend),
  apiKey: z.string(),
  fromName: z.string(),
  fromEmail: z.string(),
});

export type ResendEmailServiceConfig = z.infer<typeof resendEmailServiceConfigGuard>;

export const emailServiceConfigGuard = z.discriminatedUnion('provider', [
  sendgridEmailServiceConfigGuard,
  cloudflareEmailServiceConfigGuard,
  resendEmailServiceConfigGuard,
]);

export type EmailServiceConfig = z.infer<typeof emailServiceConfigGuard>;

export enum EmailServiceProviderKey {
  EmailServiceProvider = 'emailServiceProvider',
  EmailProviderConfigs = 'emailProviderConfigs',
}

/**
 * Named email-provider configs plus per-tier `enabled` pointers.
 *
 * Strict **write/seed** shape only. Cloud must NOT read the stored row through this guard: one
 * malformed `providers` entry would fail the whole-record parse and silently drop the live pointer,
 * so the cloud runtime reads entries leniently (drop + alert the bad one) instead.
 */
export const emailProviderConfigsGuard = z
  .object({
    /** Multiple provider configs coexist, keyed by a free-form name. */
    providers: z.record(emailServiceConfigGuard),
    /**
     * Which named config each tier uses; absent ⇒ fall through (paid → default → legacy). A set
     * pointer must reference an existing `providers` key — a dangling pointer at write time is
     * always a typo.
     */
    enabled: z
      .object({
        default: z.string().optional(),
        paid: z.string().optional(),
      })
      .strict(),
  })
  .strict()
  .superRefine(({ providers, enabled }, context) => {
    for (const [tier, name] of Object.entries(enabled)) {
      if (name && !(name in providers)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['enabled', tier],
          message: `Enabled pointer "${tier}" references a provider config that does not exist: "${name}".`,
        });
      }
    }
  });

export type EmailProviderConfigs = z.infer<typeof emailProviderConfigsGuard>;

export type EmailServiceProviderType = {
  [EmailServiceProviderKey.EmailServiceProvider]: EmailServiceConfig;
  [EmailServiceProviderKey.EmailProviderConfigs]: EmailProviderConfigs;
};

export const emailServiceProviderGuard: Readonly<{
  [key in EmailServiceProviderKey]: ZodType<EmailServiceProviderType[key]>;
}> = Object.freeze({
  [EmailServiceProviderKey.EmailServiceProvider]: emailServiceConfigGuard,
  [EmailServiceProviderKey.EmailProviderConfigs]: emailProviderConfigsGuard,
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
  blockedDomains: z.string().array().optional(), // Optional list of blocked domains
});

export type HostnameProviderData = z.infer<typeof hostnameProviderDataGuard>;

// Cloudflare KV for protected app config
export const protectedAppConfigProviderDataGuard = z.object({
  /* Cloudflare Workers & Pages account ID */
  accountIdentifier: z.string(),
  /* KV namespace ID */
  namespaceIdentifier: z.string(),
  /* Key prefix for protected app config */
  keyName: z.string(),
  /* The default domain (e.g protected.app) for the protected app */
  domain: z.string(),
  apiToken: z.string(), // Requires account permission for "KV Storage Edit"
});

export type ProtectedAppConfigProviderData = z.infer<typeof protectedAppConfigProviderDataGuard>;

/**
 * Cloudflare workers config for custom JWT.
 * Ref: https://developers.cloudflare.com/api/
 */
export const customJwtWorkerConfigGuard = z.object({
  /** Cloudflare API Key (api_key). */
  apiKey: z.string(),
  /** Cloudflare API Key (api_email). */
  apiEmail: z.string(),
  /** Cloudflare account ID. */
  accountId: z.string(),
  /** Default Cloudflare subdomain for the account. */
  subdomain: z.string(),
});

export type CustomJwtWorkerConfig = z.infer<typeof customJwtWorkerConfigGuard>;

export enum CloudflareKey {
  HostnameProvider = 'cloudflareHostnameProvider',
  ProtectedAppConfigProvider = 'cloudflareProtectedAppConfigProvider',
  ProtectedAppHostnameProvider = 'cloudflareProtectedAppHostnameProvider',
  CustomJwtWorkerConfig = 'cloudflareCustomJwtWorkerConfig',
}

export type CloudflareType = {
  [CloudflareKey.HostnameProvider]: HostnameProviderData;
  [CloudflareKey.ProtectedAppConfigProvider]: ProtectedAppConfigProviderData;
  [CloudflareKey.ProtectedAppHostnameProvider]: HostnameProviderData;
  [CloudflareKey.CustomJwtWorkerConfig]: CustomJwtWorkerConfig;
};

export const cloudflareGuard: Readonly<{
  [key in CloudflareKey]: ZodType<CloudflareType[key]>;
}> = Object.freeze({
  [CloudflareKey.HostnameProvider]: hostnameProviderDataGuard,
  [CloudflareKey.ProtectedAppConfigProvider]: protectedAppConfigProviderDataGuard,
  [CloudflareKey.ProtectedAppHostnameProvider]: hostnameProviderDataGuard,
  [CloudflareKey.CustomJwtWorkerConfig]: customJwtWorkerConfigGuard,
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
