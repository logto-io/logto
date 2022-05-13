import { z } from 'zod';

export const facebookConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type FacebookConfig = z.infer<typeof facebookConfigGuard>;

export type AccessTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type UserInfoResponse = {
  id: string;
  email?: string;
  name?: string;
  picture?: { data: { url: string } };
};
