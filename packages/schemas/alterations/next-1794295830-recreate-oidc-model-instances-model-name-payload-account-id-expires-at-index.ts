import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/** Recreate the `oidc_model_instances__model_name_payload_account_id_expires_at` index dropped by the tenant-id widening alteration. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    try {
      await withoutStatementTimeout(pool, async (connection) => {
        await connection.query(sql`
          create index concurrently oidc_model_instances__model_name_payload_account_id_expires_at
            on oidc_model_instances (tenant_id, model_name, payload_account_id, expires_at)
            where payload_account_id is not null;
        `);
      });
    } catch (error: unknown) {
      throw new Error(
        'Recreating index oidc_model_instances__model_name_payload_account_id_expires_at failed. If an index with this name already exists (invalid after an interrupted run, or valid but with unrecorded alteration state), verify its definition, run: drop index concurrently oidc_model_instances__model_name_payload_account_id_expires_at; then deploy again.',
        { cause: error }
      );
    }
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(
        sql`drop index concurrently oidc_model_instances__model_name_payload_account_id_expires_at;`
      );
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
