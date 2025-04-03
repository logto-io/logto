import { OneTimeTokenStatus } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const createOneTimeTokenLibrary = (queries: Queries) => {
  const { updateOneTimeTokenStatus: updateOneTimeTokenStatusQuery, getOneTimeTokenByToken } =
    queries.oneTimeTokens;

  const updateOneTimeTokenStatus = async (token: string, status: OneTimeTokenStatus) => {
    assertThat(status !== OneTimeTokenStatus.Active, 'one_time_token.cannot_reactivate_token');

    return updateOneTimeTokenStatusQuery(token, status);
  };

  const checkOneTimeToken = async (token: string, email: string) => {
    const oneTimeToken = await getOneTimeTokenByToken(token);

    assertThat(
      oneTimeToken,
      new RequestError({ code: 'one_time_token.token_not_found', status: 404 })
    );
    assertThat(oneTimeToken.email === email, 'one_time_token.email_mismatch');

    if (
      oneTimeToken.expiresAt <= Date.now() ||
      oneTimeToken.status === OneTimeTokenStatus.Expired
    ) {
      if (oneTimeToken.status === OneTimeTokenStatus.Active) {
        void updateOneTimeTokenStatus(token, OneTimeTokenStatus.Expired);
      }
      throw new RequestError('one_time_token.token_expired');
    }

    assertThat(
      oneTimeToken.status !== OneTimeTokenStatus.Consumed,
      'one_time_token.token_consumed'
    );
    assertThat(oneTimeToken.status !== OneTimeTokenStatus.Revoked, 'one_time_token.token_revoked');

    return oneTimeToken;
  };

  const verifyOneTimeToken = async (token: string, email: string) => {
    await checkOneTimeToken(token, email);

    return updateOneTimeTokenStatus(token, OneTimeTokenStatus.Consumed);
  };

  return { checkOneTimeToken, updateOneTimeTokenStatus, verifyOneTimeToken };
};
