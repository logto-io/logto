import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/** Index `tenants.db_user` under the "C" collation so the `db_user = current_user` tenant lookup can use an index. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently tenants__db_user_collate_c
          on tenants ((db_user collate "C"));
      `);
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`drop index concurrently tenants__db_user_collate_c;`);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
