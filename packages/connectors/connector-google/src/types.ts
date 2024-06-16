import { z } from 'zod';

import { GoogleConnector } from '@logto/connector-kit';

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

export const authResponseGuard = z.object({
  code: z.string(),
  redirectUri: z.string(),
});

/**
 * Response payload from Google One Tap. Note the CSRF token is not included since it should be
 * verified by the web server.
 */
export const googleOneTapDataGuard = z.object({
  [GoogleConnector.oneTapParams.credential]: z.string(),
});
