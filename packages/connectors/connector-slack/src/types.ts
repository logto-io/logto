import { z } from 'zod';

export const slackConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type SlackConfig = z.infer<typeof slackConfigGuard>;

export const userInfoResponseGuard = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  email_verified: z.boolean().optional().nullable(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export const accessTokenResponseGuard = z.object({
  ok: z.boolean(),
  access_token: z.string(),
  token_type: z.string(),
  id_token: z.string(),
});
