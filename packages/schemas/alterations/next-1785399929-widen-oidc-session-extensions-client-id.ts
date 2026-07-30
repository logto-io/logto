import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions alter column client_id set data type varchar(200);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table oidc_session_extensions alter column client_id set data type varchar(21);
    `);
  },
};

export default alteration;
