import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table custom_profile_fields
        drop constraint custom_profile_fields__sie_order
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table custom_profile_fields
        add constraint custom_profile_fields__sie_order unique (tenant_id, sie_order)
    `);
  },
};

export default alteration;
