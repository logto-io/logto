import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently oidc_model_instances__model_name_payload_account_id_expires_at
          on oidc_model_instances (tenant_id, model_name, payload_account_id, expires_at)
          where payload_account_id is not null;
      `);
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        drop index concurrently oidc_model_instances__model_name_payload_account_id_expires_at;
      `);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
