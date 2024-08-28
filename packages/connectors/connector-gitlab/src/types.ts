import { z } from 'zod';

// Define a configuration guard for GitLab
export const gitlabConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

// Define a guard for validating the access token response
export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

// Define a guard for validating the GitLab user info response
export const userInfoResponseGuard = z.object({
  sub: z.string(),
  sub_legacy: z.string().optional(),
  name: z.string().optional(),
  nickname: z.string(),
  preferred_username: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  profile: z.string().url().optional(),
  picture: z.string().url().optional(),
  groups: z.array(z.string()).optional(),
});

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
  error_uri: z.string(),
});

export const authResponseGuard = z.object({ code: z.string() });
