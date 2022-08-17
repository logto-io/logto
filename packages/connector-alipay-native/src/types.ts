import { z } from 'zod';

import { alipaySigningAlgorithms } from './constant';

export const alipayNativeConfigGuard = z.object({
  appId: z.string().max(16),
  privateKey: z.string(),
  signType: z.enum(alipaySigningAlgorithms),
});

export type AlipayNativeConfig = z.infer<typeof alipayNativeConfigGuard>;

// `error_response` and `alipay_system_oauth_token_response` are mutually exclusive.
export const errorResponseGuard = z.object({
  code: z.string(),
  msg: z.string(), // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
  sub_code: z.string().optional(),
  sub_msg: z.string().optional(),
});

export const alipaySystemOauthTokenResponseGuard = z.object({
  user_id: z.string(), // Unique Alipay ID, 16 digits starts with '2088'
  access_token: z.string(),
  expires_in: z.number(), // In seconds (is string type in docs which is not true)
  refresh_token: z.string(),
  re_expires_in: z.number(), // Expiration timeout of refresh token, in seconds (is string type in docs which is not true)
});

export const accessTokenResponseGuard = z.object({
  sign: z.string(), // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
  error_response: z.optional(errorResponseGuard),
  alipay_system_oauth_token_response: z.optional(alipaySystemOauthTokenResponseGuard),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const alipayUserInfoShareResponseGuard = z.object({
  user_id: z.string().optional(), // String of digits with max length of 16
  avatar: z.string().optional(), // URL of avatar
  province: z.string().optional(),
  city: z.string().optional(),
  nick_name: z.string().optional(),
  gender: z.string().optional(), // Enum type: 'F' for female, 'M' for male
  code: z.string(),
  msg: z.string(), // To know `code` and `msg` details, see: https://opendocs.alipay.com/common/02km9f
  sub_code: z.string().optional(),
  sub_msg: z.string().optional(),
});

type AlipayUserInfoShareResponseGuard = z.infer<typeof alipayUserInfoShareResponseGuard>;

export const userInfoResponseGuard = z.object({
  sign: z.string(), // To know `sign` details, see: https://opendocs.alipay.com/common/02kf5q
  alipay_user_info_share_response: alipayUserInfoShareResponseGuard,
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export type ErrorHandler = (response: AlipayUserInfoShareResponseGuard) => void;

export const authResponseGuard = z.object({ auth_code: z.string() });

export type AuthResponse = z.infer<typeof authResponseGuard>;
