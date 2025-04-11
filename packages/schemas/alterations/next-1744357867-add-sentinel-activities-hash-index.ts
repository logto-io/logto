import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index sentinel_activities__target_type_target_hash
        on sentinel_activities (tenant_id, target_type, target_hash);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index sentinel_activities__target_type_target_hash;
    `);
  },
};

export default alteration;
