import { z } from 'zod';

export const googleConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type GoogleConfig = z.infer<typeof googleConfigGuard>;

export type AccessTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

export type UserInfoResponse = {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: string;
};
