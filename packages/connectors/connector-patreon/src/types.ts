import { z } from 'zod';

// Define a configuration guard for Patreon
export const patreonConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scope: z.string().optional(),
});

export type PatreonConfig = z.infer<typeof patreonConfigGuard>;

// Define a guard for validating the access token response
export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

// Define a guard for validating the Patreon user info response
export const userInfoResponseGuard = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      full_name: z.string().optional().nullable(),
      vanity: z.string().optional().nullable(),
      url: z.string().optional().nullable(),
      image_url: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      is_email_verified: z.boolean().optional(),
    }),
  }),
});

export type PatreonUserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
  error_uri: z.string(),
});

export const authResponseGuard = z.object({ code: z.string() });
