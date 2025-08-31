import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organizations
        add column color jsonb not null default '{}'::jsonb,
        add column custom_css text;
    `);
    await pool.query(sql`
      alter table application_sign_in_experiences add column custom_css text;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organizations
        drop column color,
        drop column custom_css;
    `);
    await pool.query(sql`
      alter table application_sign_in_experiences drop column custom_css;
    `);
  },
};

export default alteration;
