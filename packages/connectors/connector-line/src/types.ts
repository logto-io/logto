import { z } from 'zod';

export const lineConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type LineConfig = z.infer<typeof lineConfigGuard>;

export const userInfoResponseGuard = z.object({
  userId: z.string(),
  displayName: z.string().nullish(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
});

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
});
