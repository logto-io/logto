import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create unique index concurrently scopes__tenant_id_id
        on scopes (tenant_id, id);
    `);

    await pool.query(sql`
      create unique index concurrently organization_scopes__tenant_id_id
        on organization_scopes (tenant_id, id);
    `);
  },
  up: async () => {
    // The indexes must be created outside of a transaction.
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists organization_scopes__tenant_id_id;
    `);
    await pool.query(sql`
      drop index concurrently if exists scopes__tenant_id_id;
    `);
  },
  down: async () => {
    // The indexes must be dropped outside of a transaction.
  },
};

export default alteration;
