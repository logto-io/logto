import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users add column is_suspended boolean not null default FALSE;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users drop column is_suspended;
    `);
  },
};

export default alteration;
