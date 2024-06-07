import { z } from 'zod';

import { oauth2ConfigGuard } from '@logto/connector-oauth';

export const huggingfaceConnectorConfigGuard = oauth2ConfigGuard.pick({
  clientId: true,
  clientSecret: true,
  scope: true,
});

export type HuggingfaceConnectorConfigGuard = z.infer<typeof huggingfaceConnectorConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  sub: z.string(),
  name: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
  error_uri: z.string(),
});

export const authResponseGuard = z.object({ code: z.string() });
