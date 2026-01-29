import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table user_geo_locations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        latitude numeric(9,6),
        longitude numeric(9,6),
        updated_at timestamptz not null default now(),
        primary key (tenant_id, user_id),
        check ((latitude is null) = (longitude is null))
      );
    `);
    await applyTableRls(pool, 'user_geo_locations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'user_geo_locations');
    await pool.query(sql`
      drop table user_geo_locations;
    `);
  },
};

export default alteration;
