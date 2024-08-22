import { trySafe } from '@silverhand/essentials';
import { errors } from 'oidc-provider';

import type Queries from '../../../tenants/Queries.js';
import assertThat from '../../../utils/assert-that.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

export const validateSubjectToken = async (
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
  throw new InvalidGrant('unsupported subject token type');
};
