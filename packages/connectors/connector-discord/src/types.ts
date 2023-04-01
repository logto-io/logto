import type { Nullable, Optional } from '@silverhand/essentials';
import { z } from 'zod';

const nullishToUndefined = <T = unknown>(input: Nullable<T>): Optional<T> => {
  if (!input) {
    return;
  }

  return input;
};

export const discordConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type DiscordConfig = z.infer<typeof discordConfigGuard>;

export const accessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});

export type AccessTokenResponse = z.infer<typeof accessTokenResponseGuard>;

export const userInfoResponseGuard = z.object({
  id: z.string(),
  username: z.string().nullish().transform(nullishToUndefined),
  avatar: z.string().nullish().transform(nullishToUndefined),
  email: z.string().nullish().transform(nullishToUndefined),
  verified: z.boolean().nullish().transform(nullishToUndefined),
});

export type UserInfoResponse = z.infer<typeof userInfoResponseGuard>;

export const authorizationCallbackErrorGuard = z.object({
  error: z.string(),
  error_description: z.string(),
});

export const authResponseGuard = z.object({ code: z.string(), redirectUri: z.string() });
