import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors
      add column enable_token_storage boolean not null default FALSE;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors
      drop column if exists enable_token_storage;
    `);
  },
};

export default alteration;
