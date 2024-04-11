import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications add protected_app_metadata jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications drop protected_app_metadata;
    `);
  },
};

export default alteration;
