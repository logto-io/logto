import { OneTimeTokens, OneTimeTokenStatus } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(OneTimeTokens);

export const createOneTimeTokenQueries = (pool: CommonQueryMethods) => {
  const insertOneTimeToken = buildInsertIntoWithPool(pool)(OneTimeTokens, {
    returning: true,
  });

  const updateExpiredOneTimeTokensStatus = async (email: string) =>
    pool.query(sql`
      update ${table}
      set ${fields.status} = ${OneTimeTokenStatus.Expired}
      where ${fields.expiresAt} <= now()
      and ${fields.status} = ${OneTimeTokenStatus.Active}
      and ${fields.email} = ${email}
    `);

  return {
    insertOneTimeToken,
    updateExpiredOneTimeTokensStatus,
  };
};
