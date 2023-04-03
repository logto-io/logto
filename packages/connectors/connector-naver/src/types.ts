import { z } from 'zod';

export const naverConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type NaverConfig = z.infer<typeof naverConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  scope: z.string().optional(),
  token_type: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

/**
 * More information about the response can be found here:
 * https://developers.naver.com/docs/login/profile/profile.md
 * https://developers.naver.com/docs/login/devguide/devguide.md
 */
export const userInfoResponseGuard = z.object({
  resultcode: z.string(),
  message: z.string(),
  response: z.object({
    id: z.string(),
    email: z.string().optional(),
    nickname: z.string().optional(),
    profile_image: z.string().optional(),
  }),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});
