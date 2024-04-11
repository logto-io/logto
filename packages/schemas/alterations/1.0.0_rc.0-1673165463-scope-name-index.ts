import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create index scopes__resource_id_name
      on scopes (
        resource_id,
        name
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index scopes__resource_id_name
    `);
  },
};

export default alteration;
