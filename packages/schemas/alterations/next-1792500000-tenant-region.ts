import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Where a tenant's data is hosted, shown in the cloud console. Tenants created before this column
// existed keep it empty and read as the local region.
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table tenants add column if not exists region_name varchar(64);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table tenants drop column if exists region_name;
    `);
  },
};

export default alteration;
