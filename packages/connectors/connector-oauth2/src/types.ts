import { z } from 'zod';

export const profileMapGuard = z
  .object({
    id: z.string().optional().default('id'),
    email: z.string().optional().default('email'),
    phone: z.string().optional().default('phone'),
    name: z.string().optional().default('name'),
    avatar: z.string().optional().default('avatar'),
  })
  .optional()
  .default({
    id: 'id',
    email: 'email',
    phone: 'phone',
    name: 'name',
    avatar: 'avatar',
  });

export type ProfileMap = z.infer<typeof profileMapGuard>;

export const userProfileGuard = z.object({
  id: z.string().or(z.number()).transform(String),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileGuard>;

const tokenEndpointResponseTypeGuard = z
  .enum(['query-string', 'json'])
  .optional()
  .default('query-string');

export type TokenEndpointResponseType = z.input<typeof tokenEndpointResponseTypeGuard>;

export const oauthConfigGuard = z.object({
  responseType: z.literal('code').optional().default('code'),
  grantType: z.literal('authorization_code').optional().default('authorization_code'),
  tokenEndpointResponseType: tokenEndpointResponseTypeGuard,
  authorizationEndpoint: z.string(),
  tokenEndpoint: z.string(),
  userInfoEndpoint: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
  profileMap: profileMapGuard,
  customConfig: z.record(z.string()).optional(),
});

export type OauthConfig = z.infer<typeof oauthConfigGuard>;

export const authResponseGuard = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;
