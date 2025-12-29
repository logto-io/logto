import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * Create aggregated_daily_active_users table for MAU-based billing system.
 * This table consolidates daily user activities for efficient billing calculations.
 */

const alteration: AlterationScript = {
  up: async (pool) => {
    // Create the aggregated daily active users table
    await pool.query(sql`
      create table aggregated_daily_active_users (
        tenant_id varchar(21) not null,
        activity_date date not null,
        user_id varchar(21) not null,
        activity_count integer not null,
        primary key (tenant_id, activity_date, user_id)
      );
    `);

    // Index for billing cycle range queries
    await pool.query(sql`
      create index aggregated_daily_active_users__tenant_date
        on aggregated_daily_active_users (tenant_id, activity_date);
    `);

    // Index for tenant-specific user activity queries
    await pool.query(sql`
      create index aggregated_daily_active_users__tenant_user_date
        on aggregated_daily_active_users (tenant_id, user_id, activity_date desc);
    `);

    await applyTableRls(pool, 'aggregated_daily_active_users');
  },

  down: async (pool) => {
    // Drop RLS policies first
    await dropTableRls(pool, 'aggregated_daily_active_users');

    // Drop the table and all its indexes
    await pool.query(sql`
      drop table aggregated_daily_active_users;
    `);
  },
};

export default alteration;
