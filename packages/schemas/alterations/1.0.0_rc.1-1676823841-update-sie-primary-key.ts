import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      drop index sign_in_experiences__id;
      alter table sign_in_experiences
        drop constraint sign_in_experiences_pkey,
        add primary key (tenant_id, id);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences
        drop constraint sign_in_experiences_pkey,
        add primary key (id);

      create index sign_in_experiences__id
        on sign_in_experiences (tenant_id, id);
    `);
  },
};

export default alteration;
