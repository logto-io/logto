import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table daily_active_users alter column date set default now();
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table daily_active_users alter column date drop default;
    `);
  },
};

export default alteration;
