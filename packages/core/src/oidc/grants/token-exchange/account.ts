import { trySafe } from '@silverhand/essentials';
import { jwtVerify } from 'jose';
import { errors } from 'oidc-provider';

import { EnvSet, type EnvSet as EnvSetType } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

export const validateSubjectToken = async (
  envSet: EnvSetType,
  queries: Queries,
  subjectToken: string,
  type: string
): Promise<{ userId: string; subjectTokenId?: string }> => {
  const {
    subjectTokens: { findSubjectToken },
    personalAccessTokens: { findByValue },
  } = queries;

  if (type === TokenExchangeTokenType.AccessToken) {
    const token = await trySafe(async () => findSubjectToken(subjectToken));
    assertThat(token, new InvalidGrant('subject token not found'));
    assertThat(token.expiresAt > Date.now(), new InvalidGrant('subject token is expired'));
    assertThat(!token.consumedAt, new InvalidGrant('subject token is already consumed'));

    return {
      userId: token.userId,
      subjectTokenId: token.id,
    };
  }
  if (type === TokenExchangeTokenType.PersonalAccessToken) {
    const token = await findByValue(subjectToken);
    assertThat(token, new InvalidGrant('subject token not found'));
    assertThat(
      !token.expiresAt || token.expiresAt > Date.now(),
      new InvalidGrant('subject token is expired')
    );

    return { userId: token.userId };
  }

  // TODO: Remove dev feature guard when JWT access token exchange is ready for production
  if (EnvSet.values.isDevFeaturesEnabled && type === TokenExchangeTokenType.JwtAccessToken) {
    const { localJWKSet, issuer } = envSet.oidc;

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
