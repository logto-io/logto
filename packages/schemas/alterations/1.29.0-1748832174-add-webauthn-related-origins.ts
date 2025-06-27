import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        add column webauthn_related_origins jsonb not null default '[]'::jsonb;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table account_centers
        drop column webauthn_related_origins;
    `);
  },
};

export default alteration;
