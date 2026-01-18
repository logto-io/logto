import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table user_country_visits (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        country varchar(2) not null,
        visited_at timestamptz not null default(now()),
        primary key (tenant_id, user_id, country)
      );

      create index user_country_visits__tenant_user_visited_at
        on user_country_visits (tenant_id, user_id, visited_at desc);
    `);
    await applyTableRls(pool, 'user_country_visits');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'user_country_visits');
    await pool.query(sql`
      drop table user_country_visits;
    `);
  },
};

export default alteration;
