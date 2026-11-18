import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/** Recreate the `users__username_lower` index dropped by the tenant-id widening alteration. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    try {
      await withoutStatementTimeout(pool, async (connection) => {
        await connection.query(sql`
          create index concurrently users__username_lower
            on users (tenant_id, username_lower)
            where username_lower is not null;
        `);
      });
    } catch (error: unknown) {
      throw new Error(
        'Recreating index users__username_lower failed. If an index with this name already exists (invalid after an interrupted run, or valid but with unrecorded alteration state), verify its definition, run: drop index concurrently users__username_lower; then deploy again.',
        { cause: error }
      );
    }
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`drop index concurrently users__username_lower;`);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
