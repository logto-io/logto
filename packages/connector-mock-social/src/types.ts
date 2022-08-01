import { z } from 'zod';

export const mockSocialConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type MockSocialConfig = z.infer<typeof mockSocialConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  sub: z.string(),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  locale: z.string().optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;
