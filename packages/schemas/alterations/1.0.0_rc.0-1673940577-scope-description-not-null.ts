import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      ALTER TABLE scopes ALTER COLUMN description SET NOT NULL;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      ALTER TABLE scopes ALTER COLUMN description DROP NOT NULL;
    `);
  },
};

export default alteration;
