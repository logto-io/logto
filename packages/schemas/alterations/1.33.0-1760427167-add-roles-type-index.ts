import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index roles__type
      on roles (tenant_id, type);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index roles__type;
    `);
  },
};

export default alteration;
