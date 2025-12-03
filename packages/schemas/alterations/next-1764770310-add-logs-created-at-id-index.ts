import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index logs__created_at_id
      on logs (tenant_id, created_at, id);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index logs__created_at_id;
    `);
  },
};

export default alteration;
