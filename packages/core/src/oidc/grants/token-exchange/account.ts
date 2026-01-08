import { trySafe } from '@silverhand/essentials';
import { type JWSHeaderParameters, type FlattenedJWSInput, type KeyLike, jwtVerify } from 'jose';
import { type Provider, errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

type ValidateSubjectTokenParams = {
  queries: Queries;
  subjectToken: string;
  subjectTokenType: string;
  /** The AccessToken class from oidc-provider for opaque token lookup. */
  AccessToken: Provider['AccessToken'];
  /** For JWT access token verification. Required when dev features are enabled. */
  jwtVerificationOptions?: {
    localJWKSet: (
      protectedHeader: JWSHeaderParameters,
      token: FlattenedJWSInput
    ) => Promise<KeyLike | Uint8Array>;
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
 * Validates a JWT access token using the issuer's JWK set.
 * JWT access tokens can be exchanged multiple times (not consumption-tracked).
 */
const validateJwtAccessToken = async (
  subjectToken: string,
  jwtVerificationOptions: NonNullable<ValidateSubjectTokenParams['jwtVerificationOptions']>
): Promise<{ userId: string }> => {
  const { localJWKSet, issuer } = jwtVerificationOptions;

  try {
    const { payload } = await jwtVerify(subjectToken, localJWKSet, { issuer });
    assertThat(payload.sub, new InvalidGrant('subject token does not contain a valid `sub` claim'));

    // JWT access tokens are not consumption-tracked, so no subjectTokenId is returned.
    // This allows the same token to be exchanged multiple times (e.g., by different services).
    return { userId: payload.sub };
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
): Promise<{ userId: string } | undefined> => {
  // eslint-disable-next-line unicorn/no-array-callback-reference -- AccessToken.find is not an array method
  const token = await trySafe(async () => AccessToken.find(subjectToken));
  if (!token?.accountId) {
    return;
  }

  // Check if the token is expired
  if (token.isExpired) {
    throw new InvalidGrant('subject token is expired');
  }

  // Opaque access tokens are not consumption-tracked, so no subjectTokenId is returned.
  // This allows the same token to be exchanged multiple times (e.g., by different services).
  return { userId: token.accountId };
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

    // Access token exchange is enabled when:
    // 1. Dev features are enabled (for development/testing)
    // 2. ACCESS_TOKEN_EXCHANGE_ENABLED env is set (for enterprise customers)
    if (EnvSet.values.isDevFeaturesEnabled || EnvSet.values.isAccessTokenExchangeEnabled) {
      // First, try to find the token as an opaque access token
      const opaqueResult = await validateOpaqueAccessToken(subjectToken, AccessToken);
      if (opaqueResult) {
        return opaqueResult;
      }

      // If not found as opaque token, try to verify as JWT
      assertThat(jwtVerificationOptions, new InvalidGrant('JWT verification options are required'));
      return validateJwtAccessToken(subjectToken, jwtVerificationOptions);
    }

    // When dev features are disabled and it's not a legacy token, reject
    throw new InvalidGrant('unsupported subject token type');
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
