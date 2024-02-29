import { generateStandardId } from '@logto/shared';

import type Queries from '#src/tenants/Queries.js';

export const recordActiveUsers = async (accessToken: { accountId?: string }, queries: Queries) => {
  const { accountId } = accessToken;
  const { insertActiveUser } = queries.dailyActiveUsers;

  if (!accountId) {
    // Some kind of tokens may not have accountId, for example, the one issued for application
    return;
  }

  // Mark this user as active today
  await insertActiveUser({
    id: generateStandardId(),
    userId: accountId,
  });
};
