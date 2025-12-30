import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * The `logs__id` index on (tenant_id, id) is redundant because:
 * 1. `id` is already the primary key, which can efficiently lookup by id
 * 2. `logs__created_at_id` index on (tenant_id, created_at, id) already covers tenant_id queries
 *
 * Removing this index reduces write IOPS during log deletion operations,
 * as each DELETE no longer needs to update this redundant index.
 */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    /**
     * Use 'if exists' to ensure idempotency.
     * 'concurrently' avoids table locks during index drop.
     */
    await pool.query(sql`
      drop index concurrently if exists logs__id;
    `);
  },
  up: async () => {
    /**
     * The index must be dropped outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty.
     */
  },
  beforeDown: async (pool) => {
    /**
     * Recreate the index if rolling back.
     * Use 'if not exists' to ensure idempotency.
     */
    await pool.query(sql`
      create index concurrently if not exists logs__id
      on logs (tenant_id, id);
    `);
  },
  down: async () => {
    /**
     * The index must be created outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty.
     */
  },
};

export default alteration;
