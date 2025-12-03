import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Add new columns for user and m2m token usage tracking
    await pool.query(sql`
      alter table daily_token_usage
      add column user_token_usage bigint not null default 0,
      add column m2m_token_usage bigint not null default 0;
    `);

    // Remove foreign key constraint to support enterprise tenant deletion requirements
    await pool.query(sql`
      alter table daily_token_usage
      drop constraint if exists daily_token_usage_tenant_id_fkey;
    `);
  },
  down: async (pool) => {
    // Remove the new columns
    await pool.query(sql`
      alter table daily_token_usage
      drop column if exists user_token_usage,
      drop column if exists m2m_token_usage;
    `);

    // Re-add the foreign key constraint
    await pool.query(sql`
      alter table daily_token_usage
      add constraint daily_token_usage_tenant_id_fkey
      foreign key (tenant_id) references tenants (id) on update cascade on delete cascade;
    `);
  },
};

export default alteration;
