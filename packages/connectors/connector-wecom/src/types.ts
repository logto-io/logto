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

export const userDetailResponseGuard = z.object({
  errcode: z.number().optional(),
  errmsg: z.string().optional(),
  userid: z.string().optional(),
  name: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().optional(),
  biz_mail: z.string().optional(),
  alias: z.string().optional(),
  qr_code: z.string().optional(),
  telephone: z.string().optional(),
  department: z.array(z.number()).optional(),
  main_department: z.number().optional(),
  order: z.array(z.number()).optional(),
  position: z.string().optional(),
  external_position: z.string().optional(),
  external_profile: z.record(z.string(), z.unknown()).optional(),
  extattr: z.record(z.string(), z.unknown()).optional(),
  avatar: z.string().optional(),
  thumb_avatar: z.string().optional(),
  gender: z.string().optional(),
  status: z.number().optional(),
  is_leader_in_dept: z.array(z.number()).optional(),
  direct_leader: z.array(z.string()).optional(),
  address: z.string().optional(),
});

export type UserDetailResponse = z.infer<typeof userDetailResponseGuard>;

export type UserDetailResponseMessageParser = (userDetail: Partial<UserDetailResponse>) => void;

export const authResponseGuard = z.object({ code: z.string() });
