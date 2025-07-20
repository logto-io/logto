import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column encrypted_secret text;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column encrypted_secret;
    `);
  },
};

export default alteration;
