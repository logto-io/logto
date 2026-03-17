import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently if not exists oidc_model_instances__grant_payload_account_id_expires_at
        on oidc_model_instances (tenant_id, (payload->>'accountId'), expires_at)
        WHERE model_name = 'Grant';
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists oidc_model_instances__grant_payload_account_id_expires_at;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty. */
  },
};

export default alteration;
