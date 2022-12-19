import { sql } from 'slonik';

import type { AlterationScript } from '../lib/src/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column forgot_password
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences add column forgot_password boolean not null default false
    `);
  },
};

export default alteration;
