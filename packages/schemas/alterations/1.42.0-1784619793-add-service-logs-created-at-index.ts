import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // Support the age-based `service_logs` retention prune's global oldest-first scan
    // (`where created_at < ? order by created_at asc limit ?`). The existing
    // `(tenant_id, type, created_at)` index leads with `tenant_id`, so it can't drive a
    // tenant-agnostic time-range scan. `concurrently` keeps the write path unlocked — this
    // unbounded table is written on every send.
    //
    // No `if not exists`: fail loud if the index already exists (e.g. a leftover invalid build from a
    // prior failed concurrent creation) instead of silently skipping.
    await pool.query(sql`
      create index concurrently service_logs__created_at
        on service_logs (created_at);
    `);
  },
  up: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists service_logs__created_at;
    `);
  },
  down: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
};

export default alteration;
