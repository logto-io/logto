import { sql, IdentifierSqlTokenType } from 'slonik';

import pool from '@/database/pool';

export const totalRowCount = async (table: IdentifierSqlTokenType) =>
  pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
  `);
