import { z } from 'zod';

import { oauth2ConfigGuard } from '@logto/connector-oauth';

export const kookConfigGuard = oauth2ConfigGuard.pick({
  clientId: true,
  clientSecret: true,
  scope: true,
});

export type KookConfig = z.infer<typeof kookConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  data: z.object({
    id: z.string(),
    username: z.string(),
    identify_num: z.string(),
    avatar: z.string().url(),
    banner: z.string().url(),
    mobile_verified: z.boolean(),
  }),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({ code: z.string(), redirectUri: z.string() });
