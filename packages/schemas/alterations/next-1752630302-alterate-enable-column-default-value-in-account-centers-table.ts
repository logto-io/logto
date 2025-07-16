import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table account_centers
      alter column enabled set default true;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table account_centers
      alter column enabled set default false;
    `);
  },
};

export default alteration;
