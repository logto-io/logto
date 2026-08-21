import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await pool.query(sql`
      create index concurrently service_logs__email__tenant_id__created_at__id
        on service_logs (tenant_id, created_at desc, id desc)
        where type in ('sendEmail', 'sendEmailFailed');
    `);
    await pool.query(sql`
      create index concurrently service_logs__email__tenant_id__recipient__created_at__id
        on service_logs (tenant_id, lower(payload->'data'->>'to'), created_at desc, id desc)
        where type in ('sendEmail', 'sendEmailFailed');
    `);
  },
  up: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty. */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently service_logs__email__tenant_id__recipient__created_at__id;
    `);
    await pool.query(sql`
      drop index concurrently service_logs__email__tenant_id__created_at__id;
    `);
  },
  down: async () => {
    /** 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty. */
  },
};

export default alteration;
