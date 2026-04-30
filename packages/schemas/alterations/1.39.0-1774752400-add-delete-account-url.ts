import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        add column delete_account_url varchar(2048);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        drop column delete_account_url;
    `);
  },
};

export default alteration;
