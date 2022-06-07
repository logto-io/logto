import { z } from 'zod';

export const weChatNativeConfigGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
  universalLinks: z.string().optional(),
});

export type WeChatNativeConfig = z.infer<typeof weChatNativeConfigGuard>;

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
