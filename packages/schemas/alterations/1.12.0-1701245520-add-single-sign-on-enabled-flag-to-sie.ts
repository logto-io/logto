import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column single_sign_on_enabled boolean not null default false;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop column single_sign_on_enabled;
    `);
  },
};

export default alteration;
