import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Remove foreign key constraint from daily_active_users table to allow
 * historical billing data to persist even after tenant deletion.
 * This supports the MAU-based billing system requirements.
 *
 * Index optimizations:
 * 1. Removes redundant (tenant_id, id) index (id is already primary key)
 * 2. Adds optimized index (tenant_id, date, user_id) for aggregation queries
 * 3. Replaces problematic partial index with BRIN index
 */

const alteration: AlterationScript = {
  up: async (pool) => {
    // Drop the existing foreign key constraint
    await pool.query(sql`
      alter table daily_active_users
      drop constraint if exists daily_active_users_tenant_id_fkey
    `);

    // Remove the redundant (tenant_id, id) index since id is already primary key
    await pool.query(sql`
      drop index if exists daily_active_users__id
    `);

    // Add optimized index for aggregation queries with better write performance
    await pool.query(sql`
      create index daily_active_users__tenant_date_user
      on daily_active_users (tenant_id, date, user_id)
    `);

    // Add BRIN index for time-series date range queries
    // Optimized for sequential data insertion and range scans (date >= ?)
    await pool.query(sql`
      create index daily_active_users__date_brin
      on daily_active_users using brin (date)
    `);
  },

  down: async (pool) => {
    // Drop the new indexes we created
    await pool.query(sql`
      drop index if exists daily_active_users__date_brin
    `);

    await pool.query(sql`
      drop index if exists daily_active_users__tenant_date_user
    `);

    // Recreate the original redundant index
    await pool.query(sql`
      create index daily_active_users__id
      on daily_active_users (tenant_id, id)
    `);

    // Recreate the foreign key constraint
    await pool.query(sql`
      alter table daily_active_users
      add constraint daily_active_users_tenant_id_fkey
      foreign key (tenant_id) references tenants(id)
      on update cascade on delete cascade
    `);
  },
};

export default alteration;
