import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column if not exists logto_config jsonb not null default '{}'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column logto_config;
    `);
  },
};

export default alteration;
