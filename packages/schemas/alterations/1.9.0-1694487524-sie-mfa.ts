import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        add column if not exists mfa jsonb not null default '{}'::jsonb;
    `);

    await pool.query(sql`
      update sign_in_experiences
        set mfa = '{"factors":[],"policy":"UserControlled"}'
        where id = 'default';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop column mfa;
    `);
  },
};

export default alteration;
