import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      ALTER TABLE scopes ALTER COLUMN resource_id SET NOT NULL;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      ALTER TABLE scopes ALTER COLUMN resource_id DROP NOT NULL;
    `);
  },
};

export default alteration;
