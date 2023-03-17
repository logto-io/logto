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

// Summary
export type SystemKey = AlterationStateKey | StorageProviderKey | DemoSocialKey;
export type SystemType = AlterationStateType | StorageProviderType | DemoSocialType;
export type SystemGuard = typeof alterationStateGuard &
  typeof storageProviderGuard &
  typeof demoSocialGuard;

export const systemKeys: readonly SystemKey[] = Object.freeze([
  ...Object.values(AlterationStateKey),
  ...Object.values(StorageProviderKey),
  ...Object.values(DemoSocialKey),
]);

export const systemGuards: SystemGuard = Object.freeze({
  ...alterationStateGuard,
  ...storageProviderGuard,
  ...demoSocialGuard,
});
