import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/** The alteration script to add the `custom_data` field to the `organizations` table. */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(
      sql`
        alter table organizations
        add column custom_data jsonb not null default '{}'::jsonb;
      `
    );
  },
  down: async (pool) => {
    await pool.query(
      sql`
        alter table organizations
        drop column custom_data;
      `
    );
  },
};

export default alteration;
