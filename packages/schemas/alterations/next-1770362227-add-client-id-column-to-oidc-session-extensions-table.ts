import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions
      add column client_id varchar(21) null
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions
      drop column client_id
    `);
  },
};

export default alteration;
