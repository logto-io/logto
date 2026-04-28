import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently oidc_model_instances__model_name_payload_grant_id_partial
        on oidc_model_instances (tenant_id, model_name, (payload->>'grantId'))
        where payload ? 'grantId';
    `);
  },
  up: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently oidc_model_instances__model_name_payload_grant_id_partial;
    `);
  },
  down: async () => {
    /** `concurrently` cannot be used inside a transaction. */
  },
};

export default alteration;
