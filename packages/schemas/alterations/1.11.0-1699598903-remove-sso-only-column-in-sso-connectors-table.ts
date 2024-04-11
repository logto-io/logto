import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors drop column sso_only;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sso_connectors add column sso_only boolean not null default FALSE;
    `);
  },
};

export default alteration;
