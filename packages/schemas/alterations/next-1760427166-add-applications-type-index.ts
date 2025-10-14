import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index applications__type
      on applications (tenant_id, type);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index applications__type;
    `);
  },
};

export default alteration;
