import { z } from 'zod';

export const weChatConfigGuard = z.object({ appId: z.string(), appSecret: z.string() });

export type WeChatConfig = z.infer<typeof weChatConfigGuard>;

export type AccessTokenResponse = {
  access_token?: string;
  openid?: string;
  expires_in?: number; // In seconds
  refresh_token?: string;
  scope?: string;
  errcode?: number;
  errmsg?: string;
};

export type UserInfoResponse = {
  unionid?: string;
  headimgurl?: string;
  nickname?: string;
  errcode?: number;
  errmsg?: string;
};
