import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table domains drop constraint domains__domain;
      alter table domains add constraint domains__domain unique (tenant_id, domain);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table domains drop constraint domains__domain;
      alter table domains add constraint domains__domain unique (domain);
    `);
  },
};

export default alteration;
