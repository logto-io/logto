import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index logs__hook_id on logs (tenant_id, (payload->>'hookId'));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index logs__hook_id;
    `);
  },
};

export default alteration;
