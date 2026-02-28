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

export const userDetailResponseGuard = z
  .object({
    errcode: z.number(),
    errmsg: z.string(),
    userid: z.string(),
    name: z.string(),
    mobile: z.string(),
    email: z.string(),
    biz_mail: z.string(),
    alias: z.string(),
    qr_code: z.string(),
    telephone: z.string(),
    department: z.array(z.number()),
    main_department: z.number(),
    order: z.array(z.number()),
    position: z.string(),
    external_position: z.string(),
    external_profile: z.record(z.string(), z.unknown()),
    extattr: z.record(z.string(), z.unknown()),
    avatar: z.string(),
    thumb_avatar: z.string(),
    gender: z.string(),
    status: z.number(),
    is_leader_in_dept: z.array(z.number()),
    direct_leader: z.array(z.string()),
    address: z.string(),
  })
  .partial();

export type UserDetailResponse = z.infer<typeof userDetailResponseGuard>;

export type UserDetailResponseMessageParser = (userDetail: Partial<UserDetailResponse>) => void;

export const authResponseGuard = z.object({ code: z.string() });
