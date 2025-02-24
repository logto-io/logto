import { z } from 'zod';

export const amazonConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type AmazonConfig = z.infer<typeof amazonConfigGuard>;

export const userInfoResponseGuard = z.object({
  user_id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
});

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
});
