import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * Create a stand-in that keeps the oidc_model_instances session, grant, and revocation lookups
 * seeking within one (tenant, model) partition while the tenant-id widening drops the payload
 * indexes. Plain columns only: an expression or predicate referencing tenant_id would be rebuilt
 * under the widening's exclusive lock, while plain-column indexes survive the type change
 * untouched. Unlike the service_logs stand-ins, this one outlives the concurrent restores — the
 * restored payload indexes cannot serve queries that still read the payload keys directly, so the
 * stand-in is dropped only once those queries are migrated to the payload_* columns fleet-wide.
 */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    try {
      await withoutStatementTimeout(pool, async (connection) => {
        await connection.query(sql`
          create index concurrently oidc_model_instances__standin_model_name_expires_at
            on oidc_model_instances (tenant_id, model_name, expires_at);
        `);
      });
    } catch (error: unknown) {
      throw new Error(
        'Creating the stand-in index oidc_model_instances__standin_model_name_expires_at failed. If an index with this name already exists (invalid after an interrupted run, or valid but with unrecorded alteration state), verify its definition, run: drop index concurrently oidc_model_instances__standin_model_name_expires_at; then deploy again.',
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
        sql`drop index concurrently oidc_model_instances__standin_model_name_expires_at;`
      );
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
