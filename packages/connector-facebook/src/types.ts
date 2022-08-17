import { z } from 'zod';

export const facebookConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type FacebookConfig = z.infer<typeof facebookConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  id: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  picture: z
    .object({
      data: z.object({
        url: z.string(),
      }),
    })
    .optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_code: z.number().optional(),
  error_description: z.string(),
  error_reason: z.string(),
});

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseGuard>;
