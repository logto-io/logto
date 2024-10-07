import { z } from 'zod';

export const tokenExchangeActGuard = z.object({
  act: z.object({
    sub: z.string(),
  }),
});

export type TokenExchangeAct = z.infer<typeof tokenExchangeActGuard>;

export enum TokenExchangeTokenType {
  AccessToken = 'urn:ietf:params:oauth:token-type:access_token',
  PersonalAccessToken = 'urn:logto:token-type:personal_access_token',
}
