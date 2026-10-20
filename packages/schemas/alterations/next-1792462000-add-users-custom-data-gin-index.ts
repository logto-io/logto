import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    /**
     * GIN index for JSONB containment (`@>`) queries on `users.custom_data`.
     *
     * Built `concurrently` to avoid blocking writes on the users table while the index is
     * created. `if not exists` keeps the alteration idempotent if it needs to be re-run.
     */
    await pool.query(sql`
      create index concurrently if not exists users_custom_data_gin
        on users using gin (custom_data jsonb_path_ops);
    `);
  },
  up: async () => {
    /**
     * The index must be created outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty.
     */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists users_custom_data_gin;
    `);
  },
  down: async () => {
    /**
     * The index must be dropped outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty.
     */
  },
};

export default alteration;
