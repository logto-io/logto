import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions
      add column if not exists last_active_at timestamptz null
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions
      drop column if exists last_active_at
    `);
  },
};

export default alteration;
