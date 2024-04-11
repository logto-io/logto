import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users add column created_at timestamptz not null default (now());
      create index users__created_at on users (created_at);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index users__created_at;
      alter table users drop column created_at;
    `);
  },
};

export default alteration;
