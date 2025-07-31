import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // No need to migrate existing data, as the feature is not released yet.
    await pool.query(sql`
      alter table users
      drop column require_mfa_on_sign_in;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
      add column require_mfa_on_sign_in boolean not null default true;
    `);
  },
};

export default alteration;
