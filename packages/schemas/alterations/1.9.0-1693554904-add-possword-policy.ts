import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/** The alteration script for adding `password_policy` column to the sign-in experience table. */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
      add column password_policy jsonb not null default '{}';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
      drop column password_policy;
    `);
  },
};

export default alteration;
