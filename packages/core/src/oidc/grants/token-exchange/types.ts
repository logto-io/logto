import { z } from 'zod';

export const tokenExchangeActGuard = z.object({
  act: z.object({
    sub: z.string(),
  }),
});

export type TokenExchangeAct = z.infer<typeof tokenExchangeActGuard>;

export enum TokenExchangeTokenType {
  /**
   * Standard access token type. When receiving this type:
   * - JWT tokens are verified using the issuer's JWK set
   * - Legacy impersonation tokens (starting with "sub_") are handled for backward compatibility
   * @see {@link https://datatracker.ietf.org/doc/html/rfc8693#section-3 | RFC 8693 Section 3}
   */
  AccessToken = 'urn:ietf:params:oauth:token-type:access_token',
  PersonalAccessToken = 'urn:logto:token-type:personal_access_token',
  /**
   * Logto-specific impersonation token type.
   * Used for subject tokens created via the impersonation API.
   * @deprecated Use AccessToken type for new implementations. This type exists for backward
   * compatibility with tokens that were created using the legacy impersonation flow.
   */
  ImpersonationToken = 'urn:logto:token-type:impersonation_token',
}
