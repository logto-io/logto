import { z } from 'zod';

export const wecomConfigGuard = z.object({
  corpId: z.string(),
  appSecret: z.string(),
  scope: z.string().optional(),
  agentId: z.string(),
});

export type WecomConfig = z.infer<typeof wecomConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string().optional(),
  expires_in: z.number().optional(), // In seconds
  errcode: z.number().optional(),
  errmsg: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export type GetAccessTokenErrorHandler = (accessToken: Partial<AccessTokenResponse>) => void;

export const userInfoResponseGuard = z.object({
  errcode: z.number().optional(),
  errmsg: z.string().optional(),
  userid: z.string().optional(),
  user_ticket: z.string().optional(),
  openid: z.string().optional(),
  external_userid: z.string().optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export type UserInfoResponseMessageParser = (userInfo: Partial<UserInfoResponse>) => void;

export const authResponseGuard = z.object({ code: z.string() });
