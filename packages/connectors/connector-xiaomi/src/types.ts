import { z } from 'zod';

export const xiaomiConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
  redirectUri: z.string().optional(),
  skipConfirm: z.boolean().optional(),
});

export type XiaomiConfig = z.infer<typeof xiaomiConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  openId: z.string(),
  union_id: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  result: z.string(),
  code: z.number(),
  description: z.string(),
  data: z.object({
    unionId: z.string(),
    miliaoNick: z.string().optional(),
    miliaoIcon: z.string().optional(),
  }),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
});

export const authResponseGuard = z.object({ code: z.string(), redirectUri: z.string() });

export const getUserInfoErrorGuard = z.object({
  code: z.number(),
  description: z.string(),
  result: z.string(),
});
