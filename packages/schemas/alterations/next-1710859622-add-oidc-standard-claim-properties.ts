import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column profile jsonb not null default '{}'::jsonb,
        add column updated_at timestamptz not null default (now());
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column profile,
        drop column updated_at;
    `);
  },
};

export default alteration;
