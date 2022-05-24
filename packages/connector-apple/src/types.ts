import { z } from 'zod';

export const appleConfigGuard = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type AppleConfig = z.infer<typeof appleConfigGuard>;

export type AccessTokenResponse = {
  access_token: string;
  id_token: string;
};
