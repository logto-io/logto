import { z } from 'zod';

export const githubConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type GithubConfig = z.infer<typeof githubConfigGuard>;

export type AccessTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

export type UserInfoResponse = {
  id: number;
  avatar_url?: string;
  email?: string;
  name?: string;
};
