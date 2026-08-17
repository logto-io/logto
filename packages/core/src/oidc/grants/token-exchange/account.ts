import { trySafe } from '@silverhand/essentials';
import { type JWTVerifyGetKey, jwtVerify } from 'jose';
import { type Provider, errors } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { resolveIsThirdPartyApplication } from '../../resource.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

type ValidateSubjectTokenParams = {
  queries: Queries;
  subjectToken: string;
  subjectTokenType: string;
  /** The AccessToken class from oidc-provider for opaque token lookup. */
  AccessToken: Provider['AccessToken'];
  /** For JWT access token verification. */
  jwtVerificationOptions?: {
    localJWKSet: JWTVerifyGetKey;
    issuer: string;
  };
};

/**
 * Validates an impersonation token (subject token created via impersonation API).
 * These tokens start with "sub_" prefix and are stored in the database.
 */
const validateImpersonationToken = async (
  findSubjectToken: Queries['subjectTokens']['findSubjectToken'],
  subjectToken: string
): Promise<{ userId: string; subjectTokenId: string }> => {
  const token = await trySafe(async () => findSubjectToken(subjectToken));
  assertThat(token, new InvalidGrant('subject token not found'));
  assertThat(token.expiresAt > Date.now(), new InvalidGrant('subject token is expired'));
  assertThat(!token.consumedAt, new InvalidGrant('subject token is already consumed'));

  return {
    userId: token.userId,
    subjectTokenId: token.id,
  };
};

/**
 * The JOSE `typ` header value that RFC 9068 assigns to OAuth 2.0 JWT access tokens. Every signed
 * JWT access token issued by the provider carries it, while ID tokens (and any other same-issuer
 * JWT) do not.
 */
const jwtAccessTokenType = 'at+jwt';

/**
 * Validates a JWT access token using the issuer's JWK set.
 * JWT access tokens can be exchanged multiple times (not consumption-tracked).
 *
 * @remarks
 * A valid signature from the tenant's JWK set is NOT sufficient: ID tokens are signed by the same
 * keys under the same issuer, so verifying only the signature would let an authentication-purpose
 * ID token (e.g. one held by a third-party application that was granted `openid` alone) be
 * submitted as an access-token subject and converted into an API access token. The token class is
 * therefore asserted explicitly before the subject is trusted.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc8725.html#section-3.12 | RFC 8725 §3.12} for the
 * general requirement that different kinds of JWTs from one issuer stay mutually exclusive.
 */
const validateJwtAccessToken = async (
  subjectToken: string,
  jwtVerificationOptions: NonNullable<ValidateSubjectTokenParams['jwtVerificationOptions']>
): Promise<{ userId: string; clientId: string }> => {
  const { localJWKSet, issuer } = jwtVerificationOptions;

  try {
    const { payload, protectedHeader } = await jwtVerify(subjectToken, localJWKSet, { issuer });

    // The media type may appear with or without the `application/` prefix. @see RFC 7515 §4.1.9.
    assertThat(
      protectedHeader.typ?.toLowerCase().replace(/^application\//, '') === jwtAccessTokenType,
      new InvalidGrant('subject token is not an access token')
    );
    // Defense in depth: every JWT access token carries `client_id`, no ID token does.
    assertThat(
      typeof payload.client_id === 'string',
      new InvalidGrant('subject token is not an access token')
    );
    assertThat(payload.sub, new InvalidGrant('subject token does not contain a valid `sub` claim'));

    // JWT access tokens are not consumption-tracked, so no subjectTokenId is returned.
    // This allows the same token to be exchanged multiple times (e.g., by different services).
    return { userId: payload.sub, clientId: payload.client_id };
  } catch (error) {
    if (error instanceof errors.OIDCProviderError) {
      throw error;
    }
    throw new InvalidGrant('invalid subject token');
  }
};

/**
 * Validates an opaque access token by looking it up via oidc-provider's AccessToken.find.
 * Opaque access tokens can be exchanged multiple times (not consumption-tracked).
 */
const validateOpaqueAccessToken = async (
  subjectToken: string,
  AccessToken: Provider['AccessToken']
): Promise<{ userId: string; clientId: string } | undefined> => {
  // eslint-disable-next-line unicorn/no-array-callback-reference -- AccessToken.find is not an array method
  const token = await trySafe(async () => AccessToken.find(subjectToken));
  if (!token?.accountId) {
    return;
  }

  // Check if the token is expired
  if (token.isExpired) {
    throw new InvalidGrant('subject token is expired');
  }

  // Every access token is bound to the client it was issued to; treat a token without that binding
  // as unusable rather than falling back to a less restrictive path.
  assertThat(token.clientId, new InvalidGrant('subject token is not bound to an issuing client'));

  // Opaque access tokens are not consumption-tracked, so no subjectTokenId is returned.
  // This allows the same token to be exchanged multiple times (e.g., by different services).
  return { userId: token.accountId, clientId: token.clientId };
};

/**
 * Asserts that the subject token was issued to a first-party application.
 *
 * @remarks
 * Token exchange does not inherit the subject token's audience or scopes: the issued token carries
 * the receiver's authorization for the user, which for a first-party receiver means every scope the
 * user's roles grant. A third-party application only ever holds credentials the user consented to
 * for that application, so letting one of its access tokens act as the subject would turn a narrow,
 * consented credential into the user's full first-party authorization.
 *
 * Third-party applications are already barred from enabling token exchange as the receiver
 * (`assertThirdPartyApplicationTokenExchangeDisabled` in the application routes); this closes the
 * same boundary on the subject side.
 *
 * A lookup that fails outright is not treated as a rejection: `invalid_grant` reads as permanent, so
 * a database hiccup would turn every legitimate exchange into an error clients do not retry and
 * cannot diagnose. Those errors propagate and surface as a 500 instead.
 */
const assertFirstPartySubjectTokenClient = async (queries: Queries, clientId: string) => {
  const isThirdParty = await resolveIsThirdPartyApplication(queries, clientId);

  // A deleted or otherwise unknown client cannot be shown to be first-party, so it is rejected.
  assertThat(
    isThirdParty !== undefined,
    new InvalidGrant('subject token was issued to an unknown client')
  );
  assertThat(
    !isThirdParty,
    new InvalidGrant('subject token was not issued to a first-party application')
  );
};

/** Prefix used by impersonation tokens. */
const IMPERSONATION_TOKEN_PREFIX = 'sub_';

export const validateSubjectToken = async ({
  queries,
  subjectToken,
  subjectTokenType,
  AccessToken,
  jwtVerificationOptions,
}: ValidateSubjectTokenParams): Promise<{ userId: string; subjectTokenId?: string }> => {
  const {
    subjectTokens: { findSubjectToken },
    personalAccessTokens: { findByValue },
  } = queries;

  // Handle impersonation token type (new explicit type)
  if (subjectTokenType === TokenExchangeTokenType.ImpersonationToken) {
    return validateImpersonationToken(findSubjectToken, subjectToken);
  }

  // Handle access token type - can be opaque token, JWT, or legacy impersonation token
  if (subjectTokenType === TokenExchangeTokenType.AccessToken) {
    // Backward compatibility: if token starts with "sub_", treat as impersonation token
    if (subjectToken.startsWith(IMPERSONATION_TOKEN_PREFIX)) {
      return validateImpersonationToken(findSubjectToken, subjectToken);
    }

    // First, try to find the token as an opaque access token
    const opaqueResult = await validateOpaqueAccessToken(subjectToken, AccessToken);
    if (opaqueResult) {
      await assertFirstPartySubjectTokenClient(queries, opaqueResult.clientId);
      return { userId: opaqueResult.userId };
    }

    // If not found as opaque token, try to verify as JWT
    assertThat(jwtVerificationOptions, new InvalidGrant('JWT verification options are required'));
    const jwtResult = await validateJwtAccessToken(subjectToken, jwtVerificationOptions);
    await assertFirstPartySubjectTokenClient(queries, jwtResult.clientId);
    return { userId: jwtResult.userId };
  }

  if (subjectTokenType === TokenExchangeTokenType.PersonalAccessToken) {
    const token = await findByValue(subjectToken);
    assertThat(token, new InvalidGrant('subject token not found'));
    assertThat(
      !token.expiresAt || token.expiresAt > Date.now(),
      new InvalidGrant('subject token is expired')
    );

    return { userId: token.userId };
  }

  throw new InvalidGrant('unsupported subject token type');
};
