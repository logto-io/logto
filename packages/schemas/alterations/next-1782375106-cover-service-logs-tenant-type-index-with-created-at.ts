import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // Cover the windowed hosted-email usage count (`where tenant_id=? and type=? and created_at>=?`) by
    // adding `created_at` to the existing `(tenant_id, type)` index, then drop the now-redundant
    // 2-column index (a left-prefix subset of the new one). `concurrently` keeps the write path
    // unlocked — this unbounded table is written on every send.
    await pool.query(sql`
      create index concurrently if not exists service_logs__tenant_id__type__created_at
        on service_logs (tenant_id, type, created_at);
    `);
    await pool.query(sql`
      drop index concurrently if exists service_logs__tenant_id__type;
    `);
  },
  up: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      create index concurrently if not exists service_logs__tenant_id__type
        on service_logs (tenant_id, type);
    `);
    await pool.query(sql`
      drop index concurrently if exists service_logs__tenant_id__type__created_at;
    `);
  },
  down: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
};

export default alteration;
