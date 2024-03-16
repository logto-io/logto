import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index users__name on users (name);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index users__name;
    `);
  },
};

export default alteration;
