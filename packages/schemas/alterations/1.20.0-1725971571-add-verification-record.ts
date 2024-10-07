import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table verification_records (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        user_id varchar(21)
          references users (id) on update cascade on delete cascade,
        created_at timestamptz not null default(now()),
        expires_at timestamptz not null,
        data jsonb /* @use VerificationRecordData */ not null default '{}'::jsonb,
        primary key (id)
      );

      create index verification_records__id
        on verification_records (tenant_id, id);
    `);
    await applyTableRls(pool, 'verification_records');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'verification_records');
    await pool.query(sql`
      drop table verification_records;
    `);
  },
};

export default alteration;
