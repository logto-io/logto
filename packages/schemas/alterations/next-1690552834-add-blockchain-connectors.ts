import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences add column blockchain_sign_in_connector_targets jsonb not null default '[]'::jsonb
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column blockchain_sign_in_connector_targets
    `);
  },
};

export default alteration;
