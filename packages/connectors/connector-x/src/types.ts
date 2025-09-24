import { z } from 'zod';

export const xConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type XConfig = z.infer<typeof xConfigGuard>;

export const userInfoResponseGuard = z.object({
  data: z.object({
    id: z.string(),
    name: z.string().optional().nullable(),
    confirmed_email: z.string().optional().nullable(),
  }),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});
