import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table one_time_tokens (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        email varchar(128) not null,
        token varchar(256) not null,
        context jsonb not null default '{}'::jsonb,
        status varchar(64) not null default 'active',
        created_at timestamptz not null default(now()),
        expires_at timestamptz not null,
        primary key (id)
      );

      create index one_time_token__email_status on one_time_tokens (tenant_id, email, status);
    `);

    await applyTableRls(pool, 'one_time_tokens');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'one_time_tokens');
    await pool.query(sql`
      drop table if exists one_time_tokens;
    `);
  },
};

export default alteration;
