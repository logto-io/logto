import { z } from 'zod';

export const feishuConfigGuard = z.object({
  appId: z.string(),
  appSecret: z.string(),
});

export type FeishuConfig = z.infer<typeof feishuConfigGuard>;

export const feishuAuthCodeGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export type FeishuAuthCode = z.infer<typeof feishuAuthCodeGuard>;

export const feishuErrorResponse = z.object({
  error: z.string(),
  error_description: z.string().optional(),
});

export type FeishuErrorResponse = z.infer<typeof feishuErrorResponse>;

export const feishuAccessTokenResponse = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  refresh_expires_in: z.number().optional(),
});

export type FeishuAccessTokenResponse = z.infer<typeof feishuAccessTokenResponse>;

export const feishuUserInfoResponse = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string(),
  open_id: z.string(),
  union_id: z.string(),
  en_name: z.string(),
  tenant_key: z.string(),
  avatar_url: z.string(),
  avatar_thumb: z.string(),
  avatar_middle: z.string(),
  avatar_big: z.string(),
  email: z.string().nullish(),
  user_id: z.string().nullish(),
  employee_no: z.string().nullish(),
  mobile: z.string().nullish(),
});

export type FeishuUserInfoResponse = z.infer<typeof feishuUserInfoResponse>;
