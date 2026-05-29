import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    /**
     * Secondary index for `user_id` lookups; the PK `(tenant_id, organization_id, user_id)`
     * cannot serve queries that filter by `tenant_id` and `user_id` alone.
     *
     * Built `concurrently` to avoid the write-blocking `SHARE` lock that a plain
     * `create index` holds on the table for the duration of the build. The table is hot
     * on every sign-in, so a multi-second lock on a large tenant translates directly
     * into request stalls. `if not exists` keeps the migration idempotent if a later
     * step in the transaction fails and the alteration needs to be re-run.
     */
    await pool.query(sql`
      create index concurrently if not exists organization_user_relations__tenant_id_user_id
        on organization_user_relations (tenant_id, user_id);
    `);
  },
  up: async () => {
    /**
     * The index must be created outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this up is intentionally left empty.
     */
  },
  beforeDown: async (pool) => {
    await pool.query(sql`
      drop index concurrently if exists organization_user_relations__tenant_id_user_id;
    `);
  },
  down: async () => {
    /**
     * The index must be dropped outside of a transaction to avoid table locks.
     * 'concurrently' cannot be used inside a transaction, so this down is intentionally left empty.
     */
  },
};

export default alteration;
