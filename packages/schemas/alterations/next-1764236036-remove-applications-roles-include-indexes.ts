import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      drop index if exists applications__include_type_is_third_party;
    `);

    await pool.query(sql`
      drop index if exists roles__include_type_name;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      create index applications__include_type_is_third_party
      on applications (tenant_id) include (type, is_third_party);
    `);

    // Update table statistics to help query planner use the new index efficiently
    await pool.query(sql`
      analyze applications;
    `);

    await pool.query(sql`
      create index roles__include_type_name
      on roles (tenant_id) include (type, name);
    `);

    // Update table statistics to help query planner use the new index efficiently
    await pool.query(sql`
      analyze roles;
    `);
  },
};

export default alteration;
