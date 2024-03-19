import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create unique index applications__protected_app_metadata_host
      on applications (
        (protected_app_metadata->>'host')
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index applications__protected_app_metadata_host;
    `);
  },
};

export default alteration;
