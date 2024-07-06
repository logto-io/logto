import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table subject_tokens (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(25) not null,
        context jsonb /* @use JsonObject */ not null default '{}'::jsonb,
        expires_at timestamptz not null,
        consumed_at timestamptz,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        created_at timestamptz not null default(now()),
        creator_id varchar(32) not null, /* It is intented to not reference to user or application table */
        primary key (id)
      );

      create index subject_token__id on subject_tokens (tenant_id, id);
    `);
    await applyTableRls(pool, 'subject_tokens');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'subject_tokens');
    await pool.query(sql`
      drop table subject_tokens
    `);
  },
};

export default alteration;
