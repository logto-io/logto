import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently oidc_model_instances__model_name_payload_grant_id
          on oidc_model_instances (tenant_id, model_name, payload_grant_id)
          where payload_grant_id is not null;
      `);
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(
        sql`drop index concurrently oidc_model_instances__model_name_payload_grant_id;`
      );
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
