import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // Add index to optimize deleting session extensions by accountId, including the
    // cascades from the users table. See the index comment in tables/oidc_session_extensions.sql.
    await pool.query(sql`
      create index concurrently oidc_session_extensions__account_id
        on oidc_session_extensions (account_id);
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently oidc_session_extensions__account_id;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty. */
  },
};

export default alteration;
