import { z } from 'zod';

export const logtoEmailConfigGuard = z.object({
  endpoint: z.string(),
  tokenEndpoint: z.string(),
  resource: z.string(),
  appId: z.string(),
  appSecret: z.string(),
});

export type LogtoEmailConfig = z.infer<typeof logtoEmailConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;
