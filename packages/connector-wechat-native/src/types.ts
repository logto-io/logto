import { z } from 'zod';

export const wechatNativeConfigGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
  universalLinks: z.string().optional(),
});

export type WechatNativeConfig = z.infer<typeof wechatNativeConfigGuard>;

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

export const authResponseGuard = z.object({ code: z.string() });
