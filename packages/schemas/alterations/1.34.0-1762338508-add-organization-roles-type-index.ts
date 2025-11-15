import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index organization_roles__type
      on organization_roles (tenant_id, type);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index organization_roles__type;
    `);
  },
};

export default alteration;
