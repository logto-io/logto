import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index users_identities_gin
      on users using GIN (identities);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index users_identities_gin;
    `);
  },
};

export default alteration;
