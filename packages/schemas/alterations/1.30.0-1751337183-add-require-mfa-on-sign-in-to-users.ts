import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
      add column require_mfa_on_sign_in boolean not null default true;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
      drop column require_mfa_on_sign_in;
    `);
  },
};

export default alteration;
