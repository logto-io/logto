import { z } from 'zod';

export const linkedInConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type LinkedInConfig = z.infer<typeof linkedInConfigGuard>;

export const userInfoResponseGuard = z.object({
  sub: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  picture: z.string().nullish(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
});

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
});
