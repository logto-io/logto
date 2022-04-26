import { IdentifierSqlToken, sql } from 'slonik';

import envSet from '@/env-set';

export const getTotalRowCount = async (table: IdentifierSqlToken) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
  `);
