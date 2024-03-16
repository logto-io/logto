import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table resources
        add column is_default boolean not null default (false);
      create unique index resources__is_default_true
        on resources (tenant_id)
        where is_default = true;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table resources
        drop is_default; 
    `);
  },
};

export default alteration;
