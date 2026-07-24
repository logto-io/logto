import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table domains
        add column verification_files jsonb not null default '[]'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table domains
        drop column verification_files;
    `);
  },
};

export default alteration;
