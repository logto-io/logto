import { trySafe } from '@silverhand/essentials';
import { type JWSHeaderParameters, type FlattenedJWSInput, type KeyLike, jwtVerify } from 'jose';
import { errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

type ValidateSubjectTokenParams = {
  queries: Queries;
  subjectToken: string;
  subjectTokenType: string;
  /** For JWT access token verification. Required when dev features are enabled. */
  jwtVerificationOptions?: {
    localJWKSet: (
      protectedHeader: JWSHeaderParameters,
      token: FlattenedJWSInput
    ) => Promise<KeyLike | Uint8Array>;
    issuer: string;
  };
};

export const validateSubjectToken = async ({
  queries,
  subjectToken,
  subjectTokenType,
  jwtVerificationOptions,
}: ValidateSubjectTokenParams): Promise<{ userId: string; subjectTokenId?: string }> => {
  const {
    subjectTokens: { findSubjectToken },
    personalAccessTokens: { findByValue },
  } = queries;

  if (subjectTokenType === TokenExchangeTokenType.AccessToken) {
    const token = await trySafe(async () => findSubjectToken(subjectToken));
    assertThat(token, new InvalidGrant('subject token not found'));
    assertThat(token.expiresAt > Date.now(), new InvalidGrant('subject token is expired'));
    assertThat(!token.consumedAt, new InvalidGrant('subject token is already consumed'));

    return {
      userId: token.userId,
      subjectTokenId: token.id,
    };
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

  // TODO: Remove dev feature guard when JWT access token exchange is ready for production
  if (
    EnvSet.values.isDevFeaturesEnabled &&
    subjectTokenType === TokenExchangeTokenType.JwtAccessToken
  ) {
    assertThat(jwtVerificationOptions, new InvalidGrant('JWT verification options are required'));
    const { localJWKSet, issuer } = jwtVerificationOptions;

    try {
      const { payload } = await jwtVerify(subjectToken, localJWKSet, { issuer });
      assertThat(
        payload.sub,
        new InvalidGrant('subject token does not contain a valid `sub` claim')
      );

      // JWT access tokens are not consumption-tracked, so no subjectTokenId is returned.
      // This allows the same token to be exchanged multiple times (e.g., by different services).
      return { userId: payload.sub };
    } catch (error) {
      if (error instanceof errors.OIDCProviderError) {
        throw error;
      }
      throw new InvalidGrant('invalid subject token');
    }
  }

  throw new InvalidGrant('unsupported subject token type');
};
