import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create unique index applications__protected_app_metadata_custom_domain
      on applications (
        (protected_app_metadata->'customDomains'->0->>'domain')
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index applications__protected_app_metadata_custom_domain;
    `);
  },
};

export default alteration;
