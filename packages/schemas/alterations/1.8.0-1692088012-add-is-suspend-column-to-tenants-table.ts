import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table tenants add column is_suspended boolean not null default false;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table tenants drop column is_suspended;
    `);
  },
};

export default alteration;
