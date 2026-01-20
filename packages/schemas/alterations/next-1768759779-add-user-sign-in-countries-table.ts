import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table user_sign_in_countries (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        country varchar(2) not null,
        last_sign_in_at timestamptz not null default(now()),
        primary key (tenant_id, user_id, country)
      );

      create index user_sign_in_countries__tenant_user_last_sign_in_at
        on user_sign_in_countries (tenant_id, user_id, last_sign_in_at desc);
    `);
    await applyTableRls(pool, 'user_sign_in_countries');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'user_sign_in_countries');
    await pool.query(sql`
      drop table user_sign_in_countries;
    `);
  },
};

export default alteration;
