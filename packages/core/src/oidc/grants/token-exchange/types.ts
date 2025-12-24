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
  /**
   * JWT access token type for service-to-service delegation.
   * Allows servers to exchange received JWT access tokens for tokens with different audiences.
   * @see {@link https://datatracker.ietf.org/doc/html/rfc8693#section-3 | RFC 8693 Section 3}
   */
  JwtAccessToken = 'urn:ietf:params:oauth:token-type:jwt',
}
