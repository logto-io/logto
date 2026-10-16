/**
 * @file The Account API's authentication-context policy: the OIDC authentication context an access
 * token must carry for a sensitive Account API operation to count as identity-verified, and the
 * RFC 9470 challenge that asks a first-party client for one when the context is missing or stale.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9470.html | RFC 9470 OAuth 2.0 Step Up Authentication Challenge Protocol}
 */
import { LogtoAcr, acrSatisfies } from '@logto/schemas';
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

/** How old the end user's last authentication may be, in seconds. */
export const maximumAuthenticationAgeInSeconds = 600;

/**
 * Whether the last user authentication is recent enough. `authTime` is in seconds, as OpenID
 * Connect Core defines `auth_time`; token issuance time (`iat`) never substitutes for it, since a
 * refreshed token carries the original authentication event.
 */
export const isAuthenticationContextFresh = (authTime: number, now = Date.now()) => {
  const ageInSeconds = now / 1000 - authTime;

  // A timestamp in the future is not a recent authentication either.
  return ageInSeconds >= 0 && ageInSeconds <= maximumAuthenticationAgeInSeconds;
};

/**
 * Whether the token's authentication context satisfies the Account API policy. The caller's
 * application is checked separately: no context, however strong, lets a third-party application
 * operate on the account here.
 */
export const satisfiesAuthenticationContextPolicy = (extra: unknown, now = Date.now()) => {
  const result = authenticationContextGuard.safeParse(extra);

  return (
    result.success &&
    acrSatisfies(result.data.acr, requiredAcr) &&
    isAuthenticationContextFresh(result.data.auth_time, now)
  );
};

/** Escape a value that is embedded in an HTTP `quoted-string`, per RFC 9110. */
export const escapeQuotedString = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');

/**
 * Build the RFC 9470 `WWW-Authenticate` challenge for a sensitive request that lacks recent user
 * authentication, so a client can retry through a step-up instead of the legacy verification
 * record. The JSON body of the error response is unchanged.
 */
export const buildInsufficientUserAuthenticationChallenge = () => {
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
