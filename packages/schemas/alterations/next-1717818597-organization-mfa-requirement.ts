import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organizations add column is_mfa_required boolean not null default false;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organizations drop column is_mfa_required;
    `);
  },
};

export default alteration;
