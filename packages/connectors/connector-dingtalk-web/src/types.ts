import { z } from 'zod';

export const dingtalkConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type DingtalkConfig = z.infer<typeof dingtalkConfigGuard>;

export const accessTokenResponseGuard = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expireIn: z.number().optional(), // In seconds
  corpId: z.string().optional(),
});

// https://open.dingtalk.com/document/isvapp/dingtalk-retrieve-user-information
export const userInfoResponseGuard = z.object({
  nick: z.string().optional(),
  avatarUrl: z.string().optional(),
  mobile: z.string().optional(),
  openId: z.string().optional(), // DingTalk no longer recommends using OpenId for integration. Instead, use unionId.
  unionId: z.string(),
  email: z.string().optional(),
  stateCode: z.string().optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export type UserInfoResponseMessageParser = (userInfo: Partial<UserInfoResponse>) => void;

export const authResponseGuard = z.object({ code: z.string() });
