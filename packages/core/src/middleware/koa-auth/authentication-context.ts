/**
 * @file The Account API's authentication-context policy: the OIDC authentication context an access
 * token must carry for a sensitive Account API operation to count as identity-verified, and the
 * RFC 9470 challenge that asks a first-party client for one when the context is missing or stale.
 *
 * The freshness window is the tenant's account center setting
 * (`account_centers.maximum_authentication_age_in_seconds`), not a constant: see
 * `findDefaultAccountCenter` in `queries/account-center.ts`.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9470.html | RFC 9470 OAuth 2.0 Step Up Authentication Challenge Protocol}
 */
import { LogtoAcr, acrSatisfies, defaultMaximumAuthenticationAgeInSeconds } from '@logto/schemas';
import { z } from 'zod';

/**
 * The authentication context token claims, as `getExtraTokenClaimsForAuthenticationContext` writes
 * them to an opaque access token's `extra` (and as the equivalent JWT access-token claims). Parsed
 * strictly: a claim of the wrong type, a missing `acr`, or a fractional `auth_time` fails the
 * policy instead of being coerced.
 */
const authenticationContextGuard = z.object({
  acr: z.string(),
  auth_time: z.number().int(),
});

/** The class a caller must reach to operate on its own account. `mfa` satisfies `1fa`. */
const requiredAcr = LogtoAcr.FirstFactor;

/**
 * Whether the last user authentication is recent enough for the tenant's authentication policy.
 * `authTime` is in seconds, as OpenID Connect Core defines `auth_time`; token issuance time (`iat`)
 * never substitutes for it, since a refreshed token carries the original authentication event.
 */
export const isAuthenticationContextFresh = (
  authTime: number,
  maximumAuthenticationAgeInSeconds: number,
  now = Date.now()
) => {
  const ageInSeconds = now / 1000 - authTime;

  // A timestamp in the future is not a recent authentication either.
  return ageInSeconds >= 0 && ageInSeconds <= maximumAuthenticationAgeInSeconds;
};

/**
 * Whether the token's authentication context satisfies the Account API policy under the tenant's
 * freshness window. The caller's application is checked separately: no context, however strong,
 * lets a third-party application operate on the account here.
 */
export const satisfiesAuthenticationContextPolicy = (
  extra: unknown,
  maximumAuthenticationAgeInSeconds: number,
  now = Date.now()
) => {
  const result = authenticationContextGuard.safeParse(extra);

  return (
    result.success &&
    acrSatisfies(result.data.acr, requiredAcr) &&
    isAuthenticationContextFresh(result.data.auth_time, maximumAuthenticationAgeInSeconds, now)
  );
};

/** Escape a value that is embedded in an HTTP `quoted-string`, per RFC 9110. */
export const escapeQuotedString = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

/**
 * Build the RFC 9470 `WWW-Authenticate` challenge for a sensitive request that lacks recent user
 * authentication, so a client can retry through a step-up instead of the legacy verification
 * record. `max_age` carries the same tenant policy the request was rejected by, so the client and
 * the server agree on the required window. The JSON body of the error response is unchanged.
 */
export const buildInsufficientUserAuthenticationChallenge = (
  maximumAuthenticationAgeInSeconds = defaultMaximumAuthenticationAgeInSeconds
) => {
  const parameters: Array<[string, string]> = [
    ['error', 'insufficient_user_authentication'],
    ['error_description', 'Recent user authentication is required'],
    ['acr_values', requiredAcr],
    ['max_age', maximumAuthenticationAgeInSeconds.toString()],
  ];

  return `Bearer ${parameters
    .map(([key, value]) => `${key}="${escapeQuotedString(value)}"`)
    .join(', ')}`;
};
