import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index daily_active_users__date
      on daily_active_users (tenant_id, date);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index daily_active_users__date;
    `);
  },
};
export default alteration;
