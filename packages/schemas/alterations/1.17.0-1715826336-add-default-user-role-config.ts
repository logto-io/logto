import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table roles add column is_default boolean not null default false;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table roles drop column is_default;
    `);
  },
};

export default alteration;
