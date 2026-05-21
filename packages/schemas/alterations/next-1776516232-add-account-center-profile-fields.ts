import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        add column profile_fields jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        drop column profile_fields;
    `);
  },
};

export default alteration;
