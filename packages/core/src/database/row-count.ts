import type { CommonQueryMethods, IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

import { type SearchOptions, buildSearchSql } from './utils.js';

export const buildGetTotalRowCountWithPool =
  (pool: CommonQueryMethods, table: string) =>
  async <SearchKeys extends string>(search?: SearchOptions<SearchKeys>) => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${sql.identifier([table])}
      ${buildSearchSql(search)}
    `);

    return { count: Number(count) };
  };

export const getTotalRowCountWithPool =
  (pool: CommonQueryMethods) => async (table: IdentifierSqlToken) => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
    `);

    return { count: Number(count) };
  };
