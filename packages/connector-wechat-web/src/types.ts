import { z } from 'zod';

export const wechatConfigGuard = z.object({ appId: z.string(), appSecret: z.string() });

export type WechatConfig = z.infer<typeof wechatConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string().optional(),
  openid: z.string().optional(),
  expires_in: z.number().optional(), // In seconds
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  errcode: z.number().optional(),
  errmsg: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export type GetAccessTokenErrorHandler = (accessToken: Partial<AccessTokenResponse>) => void;

export const userInfoResponseGuard = z.object({
  unionid: z.string().optional(),
  headimgurl: z.string().optional(),
  nickname: z.string().optional(),
  errcode: z.number().optional(),
  errmsg: z.string().optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export type UserInfoResponseMessageParser = (userInfo: Partial<UserInfoResponse>) => void;

export const authResponseGuard = z.object({
  code: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseGuard>;
