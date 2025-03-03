import { OneTimeTokenStatus } from '@logto/schemas';

import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const createOneTimeTokenLibrary = (queries: Queries) => {
  const { updateOneTimeTokenStatus: updateOneTimeTokenStatusQuery } = queries.oneTimeTokens;

  const updateOneTimeTokenStatus = async (
    email: string,
    token: string,
    status: OneTimeTokenStatus
  ) => {
    assertThat(status !== OneTimeTokenStatus.Active, 'one_time_token.cannot_reactivate_token');

    return updateOneTimeTokenStatusQuery(email, token, status);
  };

  return { updateOneTimeTokenStatus };
};
