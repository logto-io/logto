import { DailyActiveUsers } from '@logto/schemas';
import type { CommonQueryMethods } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

export const createDailyActiveUsersQueries = (pool: CommonQueryMethods) => {
  const insertActiveUser = buildInsertIntoWithPool(pool)(DailyActiveUsers, {
    onConflict: { ignore: true },
  });

  return {
    insertActiveUser,
  };
};
