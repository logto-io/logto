import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table users
        add column if not exists mfa_verifications jsonb not null default '[]'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users
        drop column mfa_verifications;
    `);
  },
};

export default alteration;
