import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    /**
     * Use 'if not exists' to ensure idempotency.
     * If the subsequent transaction in 'up' fails, the migration can be safely re-run without failing on an already created index.
     */
    await pool.query(sql`
      create index concurrently if not exists logs__created_at_id
      on logs (tenant_id, created_at, id);
    `);
  },
  up: async () => {
    /**
     * The index on the logs table must be created outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty.
     */
  },
  beforeDown: async (pool) => {
    /**
     * Use 'if exists' to ensure idempotency. If the subsequent transaction in 'down' fails,
     * the rollback can be safely re-run without failing on a non-existent index.
     */
    await pool.query(sql`
      drop index concurrently if exists logs__created_at_id;
    `);
  },
  down: async () => {
    /**
     * The index on the logs table must be dropped outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty.
     */
  },
};

export default alteration;
