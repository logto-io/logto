import { OneTimeTokens, OneTimeTokenStatus, type OneTimeToken } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildDeleteByIdWithPool } from '#src/database/delete-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(OneTimeTokens);

export const createOneTimeTokenQueries = (pool: CommonQueryMethods) => {
  const insertOneTimeToken = buildInsertIntoWithPool(pool)(OneTimeTokens, {
    returning: true,
  });

  const countOneTimeTokens = async (where: OneTimeTokenConditions) => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      ${buildConditionsSql(where)}
    `);

    return { count: Number(count) };
  };

  const getOneTimeTokens = async (
    where: OneTimeTokenConditions,
    pagination?: { limit: number; offset: number }
  ) => pool.any<OneTimeToken>(buildFindEntitiesSql(where, pagination));

  const getOneTimeTokenById = async (id: string) => {
    const oneTimeToken = await pool.maybeOne<OneTimeToken>(buildFindEntitiesSql({ id }));

    assertThat(
      oneTimeToken,
      new RequestError({
        code: 'entity.not_exists_with_id',
        name: OneTimeTokens.table,
        id,
        status: 404,
      })
    );

    return oneTimeToken;
  };

  const getOneTimeTokenByToken = async (token: string) => {
    const oneTimeToken = await pool.maybeOne<OneTimeToken>(sql`
      select *
      from ${table}
      where ${fields.token} = ${token}
    `);

    assertThat(
      oneTimeToken,
      new RequestError({ code: 'one_time_token.token_not_found', token, status: 404 })
    );

    return oneTimeToken;
  };

  const deleteOneTimeTokenById = buildDeleteByIdWithPool(pool, OneTimeTokens.table);

  const updateExpiredOneTimeTokensStatusByEmail = async (email: string) =>
    pool.query(sql`
      update ${table}
      set ${fields.status} = ${OneTimeTokenStatus.Expired}
      where ${fields.expiresAt} <= now()
      and ${fields.status} = ${OneTimeTokenStatus.Active}
      and ${fields.email} = ${email}
    `);

  const updateOneTimeTokenStatus = async (token: string, status: OneTimeTokenStatus) =>
    pool.one<OneTimeToken>(sql`
      update ${table}
      set ${fields.status} = ${status}
      where ${fields.token} = ${token}
      returning *
    `);

  /**
   * Revoke the active tokens issued for an email, compared case-insensitively, except the one with
   * `exceptId` if given.
   */
  const revokeActiveOneTimeTokensByEmail = async (email: string, exceptId?: string) =>
    pool.query(sql`
      update ${table}
      set ${fields.status} = ${OneTimeTokenStatus.Revoked}
      where ${fields.status} = ${OneTimeTokenStatus.Active}
      and lower(${fields.email}) = lower(${email})
      ${conditionalSql(exceptId, (id) => sql`and ${fields.id} <> ${id}`)}
    `);

  return {
    deleteOneTimeTokenById,
    revokeActiveOneTimeTokensByEmail,
    countOneTimeTokens,
    getOneTimeTokens,
    getOneTimeTokenById,
    getOneTimeTokenByToken,
    insertOneTimeToken,
    updateExpiredOneTimeTokensStatusByEmail,
    updateOneTimeTokenStatus,
  };
};

type OneTimeTokenConditions = Partial<Pick<OneTimeToken, 'id' | 'token' | 'email' | 'status'>>;

/**
 * Shared by the list and the count queries so the reported total always describes the same rows as
 * the list it accompanies.
 */
const buildConditionsSql = (where: OneTimeTokenConditions) => {
  const whereEntries = Object.entries(where).filter(([_, value]) => Boolean(value));

  return conditionalSql(
    whereEntries.length > 0 && whereEntries,
    (whereEntries) =>
      sql`where ${sql.join(
        whereEntries.map(([column, value]) =>
          conditionalSql(value, (value) => sql`${sql.identifier([column])} = ${value}`)
        ),
        sql` and `
      )}`
  );
};

const buildFindEntitiesSql = (
  where: OneTimeTokenConditions,
  pagination?: { limit: number; offset: number }
) =>
  sql`
    select
      ${sql.join(
        Object.values(fields).filter((field) => field !== fields.status),
        sql`, `
      )},
      case
        when
          ${fields.status} = ${OneTimeTokenStatus.Active} and
          ${fields.expiresAt} < now()
        then ${OneTimeTokenStatus.Expired}
        else ${fields.status}
      end as "status"
    from ${table}
    ${buildConditionsSql(where)}
    order by ${fields.createdAt} desc
    ${conditionalSql(pagination, ({ limit, offset }) => sql`limit ${limit} offset ${offset}`)}
  `;
