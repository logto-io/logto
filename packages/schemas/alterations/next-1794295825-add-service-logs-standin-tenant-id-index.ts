import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * Create a temporary stand-in that keeps service_logs query coverage while the tenant-id
 * widening drops and concurrently rebuilds `service_logs__email__tenant_id__created_at__id`.
 * The release that restores the original removes the stand-in.
 */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    try {
      await withoutStatementTimeout(pool, async (connection) => {
        await connection.query(sql`
          create index concurrently service_logs__standin_tenant_id_created_at_id
            on service_logs (tenant_id, created_at desc, id desc);
        `);
      });
    } catch (error: unknown) {
      throw new Error(
        'Creating the stand-in index service_logs__standin_tenant_id_created_at_id failed. If an index with this name already exists (invalid after an interrupted run, or valid but with unrecorded alteration state), verify its definition, run: drop index concurrently service_logs__standin_tenant_id_created_at_id; then deploy again.',
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
        sql`drop index concurrently service_logs__standin_tenant_id_created_at_id;`
      );
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
