import { OneTimeTokens, OneTimeTokenStatus, type OneTimeToken } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(OneTimeTokens);

export const createOneTimeTokenQueries = (pool: CommonQueryMethods) => {
  const insertOneTimeToken = buildInsertIntoWithPool(pool)(OneTimeTokens, {
    returning: true,
  });

  const updateExpiredOneTimeTokensStatusByEmail = async (email: string) =>
    pool.query(sql`
      update ${table}
      set ${fields.status} = ${OneTimeTokenStatus.Expired}
      where ${fields.expiresAt} <= now()
      and ${fields.status} = ${OneTimeTokenStatus.Active}
      and ${fields.email} = ${email}
    `);

  const getOneTimeTokenByToken = async (token: string) =>
    pool.maybeOne<OneTimeToken>(sql`
      select *
      from ${table}
      where ${fields.token} = ${token}
    `);

  const updateOneTimeTokenStatus = async (token: string, status: OneTimeTokenStatus) =>
    pool.one<OneTimeToken>(sql`
      update ${table}
      set ${fields.status} = ${status}
      where ${fields.token} = ${token}
      returning *
    `);

  return {
    insertOneTimeToken,
    updateExpiredOneTimeTokensStatusByEmail,
    getOneTimeTokenByToken,
    updateOneTimeTokenStatus,
  };
};
