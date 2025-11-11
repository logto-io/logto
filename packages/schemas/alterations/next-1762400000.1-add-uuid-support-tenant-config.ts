import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

/**
 * Add UUID support - Part 1: tenant_id_config table
 *
 * This migration creates or migrates the tenant_id_config table to support
 * the new unified ID format configuration (nanoid or uuidv7).
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    // Check if tenant_id_config table exists
    const tableExists = await pool.exists(sql`
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'tenant_id_config'
    `);

    if (tableExists) {
      // Table exists with old schema (4 columns), migrate to new schema (1 column)
      // Check if old columns exist
      const hasOldColumns = await pool.exists(sql`
        select 1 from information_schema.columns
        where table_name = 'tenant_id_config' and column_name = 'user_id_format'
      `);

      if (hasOldColumns) {
        // Migrate from old schema to new schema
        // Add new id_format column
        await pool.query(sql`
          alter table tenant_id_config
            add column id_format varchar(10);
        `);

        // Migrate data: use user_id_format as the unified format
        // (all 4 columns should have the same value in practice)
        await pool.query(sql`
          update tenant_id_config
            set id_format = user_id_format;
        `);

        // Make id_format not null with default
        await pool.query(sql`
          alter table tenant_id_config
            alter column id_format set not null,
            alter column id_format set default 'nanoid';
        `);

        // Drop old columns
        await pool.query(sql`
          alter table tenant_id_config
            drop column user_id_format,
            drop column organization_id_format,
            drop column role_id_format,
            drop column organization_role_id_format;
        `);

        // Update column sizes from varchar(20) to varchar(10) if needed
        await pool.query(sql`
          alter table tenant_id_config
            alter column id_format type varchar(10);
        `);
      }
    } else {
      // Table doesn't exist, create it with new schema
      await pool.query(sql`
        create table tenant_id_config (
          tenant_id varchar(21) not null primary key
            references tenants (id) on update cascade on delete cascade,
          id_format varchar(10) not null default 'nanoid',
          created_at timestamptz not null default(now()),
          updated_at timestamptz not null default(now())
        );
      `);

      await pool.query(sql`
        create index tenant_id_config__tenant_id
          on tenant_id_config (tenant_id);
      `);

      // Apply Row-Level Security policies
      await applyTableRls(pool, 'tenant_id_config');
    }
  },
  down: async (pool) => {
    await dropTableRls(pool, 'tenant_id_config');
    await pool.query(sql`
      drop table if exists tenant_id_config;
    `);
  },
};

export default alteration;
