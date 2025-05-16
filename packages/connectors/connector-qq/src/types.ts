import { z } from 'zod';

export const qqConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
  redirectUri: z.string().optional(),
});

export type QQConfig = z.infer<typeof qqConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  expires_in: z.string(),
  refresh_token: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const openIdAndUnionIdResponseGuard = z.object({
  client_id: z.string().optional(),
  openid: z.string(),
  unionid: z.string(),
});

export type OpenIdAndUnionIdResponse = z.infer<typeof openIdAndUnionIdResponseGuard>;

export const userInfoResponseGuard = z.object({
  ret: z.number(),
  msg: z.string(),
  is_lost: z.number().optional(),
  nickname: z.string(),
  gender: z.string().optional(),
  gender_type: z.number().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  year: z.string().optional(),
  figureurl: z.string().optional(),
  figureurl_1: z.string().optional(),
  figureurl_2: z.string().optional(),
  figureurl_qq: z.string().optional(),
  figureurl_qq_1: z.string().optional(),
  figureurl_qq_2: z.string().optional(),
  is_yellow_vip: z.string().optional(),
  vip: z.string().optional(),
  yellow_vip_level: z.string().optional(),
  level: z.string().optional(),
  is_yellow_year_vip: z.string().optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
});

export const authResponseGuard = z.object({ code: z.string(), redirectUri: z.string() });

export const getUserInfoErrorGuard = z.object({
  ret: z.number(),
  msg: z.string(),
});
