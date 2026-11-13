import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/** Recreate the `service_logs__email__tenant_id__recipient__created_at__id` index dropped by the tenant-id widening alteration. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    try {
      await withoutStatementTimeout(pool, async (connection) => {
        await connection.query(sql`
          create index concurrently service_logs__email__tenant_id__recipient__created_at__id
            on service_logs (tenant_id, lower(payload->'data'->>'to'), created_at desc, id desc)
            where type in ('sendEmail', 'sendEmailFailed');
        `);
      });
    } catch (error: unknown) {
      throw new Error(
        'Recreating index service_logs__email__tenant_id__recipient__created_at__id failed. If an index with this name already exists (invalid after an interrupted run, or valid but with unrecorded alteration state), verify its definition, run: drop index concurrently service_logs__email__tenant_id__recipient__created_at__id; then deploy again.',
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
        sql`drop index concurrently service_logs__email__tenant_id__recipient__created_at__id;`
      );
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
