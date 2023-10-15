import type { CommonQueryMethods, IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

export const buildGetTotalRowCountWithPool =
  (pool: CommonQueryMethods, table: string) => async () => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${sql.identifier([table])}
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
