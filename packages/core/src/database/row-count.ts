import type { CommonQueryMethods, IdentifierSqlToken } from 'slonik';
import { sql } from 'slonik';

import envSet from '#src/env-set/index.js';

export const getTotalRowCountWithPool =
  (pool: CommonQueryMethods) => async (table: IdentifierSqlToken) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
    `);

/** @deprecated Will be removed soon. Use getTotalRowCountWithPool() factory instead. */
export const getTotalRowCount = getTotalRowCountWithPool(envSet.pool);
