import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * Drop the `oidc_model_instances__standin_model_name_expires_at` stand-in: the session, grant, and
 * revocation lookups seek the `payload_*` column indexes. If this fails because the index is
 * already gone (interrupted run with unrecorded alteration state), verify and reconcile manually;
 * the stand-in must not survive this alteration.
 */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(
        sql`drop index concurrently oidc_model_instances__standin_model_name_expires_at;`
      );
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
        create index concurrently oidc_model_instances__standin_model_name_expires_at
          on oidc_model_instances (tenant_id, model_name, expires_at);
      `);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
