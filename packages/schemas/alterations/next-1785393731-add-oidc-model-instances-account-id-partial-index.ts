import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    // Add index to optimize revoking access tokens and refresh tokens by accountId.
    // See the index comment in tables/oidc_model_instances.sql for the predicate rationale.
    await pool.query(sql`
      create index concurrently oidc_model_instances__model_name_payload_account_id_partial
        on oidc_model_instances (tenant_id, model_name, (payload->>'accountId'))
        where payload ? 'accountId';
    `);

    // Collect expression statistics right away instead of waiting for autovacuum.
    await pool.query(sql`
      analyze oidc_model_instances;
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently oidc_model_instances__model_name_payload_account_id_partial;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty. */
  },
};

export default alteration;
