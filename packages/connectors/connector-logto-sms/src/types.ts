import { z } from 'zod';

export const logtoSmsConfigGuard = z.object({
  endpoint: z.string(),
  tokenEndpoint: z.string(),
  resource: z.string(),
  appId: z.string(),
  appSecret: z.string(),
});

export type LogtoSmsConfig = z.infer<typeof logtoSmsConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;
