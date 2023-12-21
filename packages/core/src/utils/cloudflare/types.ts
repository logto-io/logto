import { type ProtectedAppMetadata } from '@logto/schemas';
import { type Response } from 'got';
import { type ZodType, z } from 'zod';

export const cloudflareResponseGuard = z.object({
  success: z.boolean(),
  result: z.unknown(),
});

export const cloudflareHostnameResponseGuard = z
  .object({
    origin: z.string(),
  })
  .catchall(z.unknown());

export type HandleResponse = {
  <T>(response: Response<string>, guard: ZodType<T>): T;
  (response: Response<string>): void;
};

export type SiteConfigs = ProtectedAppMetadata & {
  /* The Logto SDK configuration */
  sdkConfig: {
    /* The client ID of the application */
    appId: string;
    /* The client secret of the application */
    appSecret: string;
    /* The Logto endpoint */
    endpoint: string;
  };
};
