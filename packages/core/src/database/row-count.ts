import type { CommonQueryMethods, IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

export const getTotalRowCountWithPool =
  (pool: CommonQueryMethods) => async (table: IdentifierSqlToken) => {
    // Postgres returns a biging for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
    `);

    return { count: Number(count) };
  };
