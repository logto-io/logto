import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * Drop the `service_logs__standin_tenant_id_created_at_id` stand-in, which covered service_logs
 * email queries while `service_logs__email__tenant_id__created_at__id` was dropped and
 * concurrently recreated. If this fails
 * because the index is already gone (interrupted run with unrecorded alteration state),
 * verify and reconcile manually; the stand-in must not survive this alteration.
 */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(
        sql`drop index concurrently service_logs__standin_tenant_id_created_at_id;`
      );
    });
  },
  up: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
  beforeDown: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      await connection.query(sql`
          create index concurrently service_logs__standin_tenant_id_created_at_id
            on service_logs (tenant_id, created_at desc, id desc);
      `);
    });
  },
  down: async () => {
    /** `concurrently` cannot run inside a transaction. */
  },
};

export default alteration;
