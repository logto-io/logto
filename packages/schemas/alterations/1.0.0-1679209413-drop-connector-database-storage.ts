import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table connectors drop storage;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table connectors add storage jsonb not null default '{}'::jsonb;
    `);
  },
};

export default alteration;
