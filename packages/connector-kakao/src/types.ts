import { z } from 'zod';

export const kakaoConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string().optional(),
});

export type KakaoConfig = z.infer<typeof kakaoConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  scope: z.string().optional(),
  token_type: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  id: z.number(),
  kakao_account: z
    .object({
      is_email_valid: z.boolean().optional(),
      email: z.string().optional(),
      profile: z
        .object({
          nickname: z.string().optional(),
          profile_image_url: z.string().optional(),
          is_default_image: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});
