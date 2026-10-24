import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table account_centers
      add column maximum_authentication_age_in_seconds integer not null default 600;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table account_centers
      drop column maximum_authentication_age_in_seconds;
    `);
  },
};

export default alteration;
