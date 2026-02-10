import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // Add index to optimize the query performance for cleaning up expired OIDC model instances.
    await pool.query(sql`
      create index concurrently if not exists oidc_model_instances__expires_at
        on oidc_model_instances (tenant_id, expires_at);
    `);

    // Add index to optimize the query performance for querying non-expired session instances by accountId.
    await pool.query(sql`
      create index concurrently if not exists oidc_model_instances__session_payload_account_id_expires_at
        on oidc_model_instances (tenant_id, (payload->>'accountId'), expires_at)
        WHERE model_name = 'Session';
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists oidc_model_instances__expires_at;
    `);

    await pool.query(sql`
      drop index concurrently if exists oidc_model_instances__session_payload_account_id_expires_at;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
};

export default alteration;
