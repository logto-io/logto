import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently if not exists sentinel_activities__created_at
        on sentinel_activities (created_at);
    `);
  },
  up: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists sentinel_activities__created_at;
    `);
  },
  down: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
};

export default alteration;
