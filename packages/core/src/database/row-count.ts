import type { IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

import envSet from '#src/env-set/index.js';

export const getTotalRowCount = async (table: IdentifierSqlToken) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
  `);
