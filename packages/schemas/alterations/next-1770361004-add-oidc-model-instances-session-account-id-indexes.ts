import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Add index to optimize the query performance for cleaning up expired OIDC model instances.
    await pool.query(sql`
      create index concurrently oidc_model_instances__expires_at
        on oidc_model_instances (tenant_id, expires_at);
    `);

    // Add index to optimize the query performance for query not expired session instances by accountId.
    await pool.query(sql`
      create index concurrently oidc_model_instances__session_payload_account_id_expires_at
        ON oidc_model_instances (tenant_id, (payload->>'accountId'), expires_at)
        WHERE model_name = 'Session';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists oidc_model_instances__expires_at;
    `);

    await pool.query(sql`
      drop index concurrently if exists oidc_model_instances__session_payload_account_id_expires_at;
    `);
  },
};

export default alteration;
