import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create unique index one_time_token__token on one_time_tokens (tenant_id, token);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index if exists one_time_token__token;
    `);
  },
};

export default alteration;
