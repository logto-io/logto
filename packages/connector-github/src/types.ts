import { z } from 'zod';

export const githubConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type GithubConfig = z.infer<typeof githubConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  id: z.number(),
  avatar_url: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
  error_uri: z.string(),
});

export const authResponseGuard = z.object({ code: z.string() });
