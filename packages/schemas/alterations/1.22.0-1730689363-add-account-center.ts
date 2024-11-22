import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table account_centers (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        /** The whole feature can be disabled */
        enabled boolean not null default false,
        /** Control each fields */
        fields jsonb /* @use AccountCenterFieldControl */ not null default '{}'::jsonb,
        primary key (tenant_id, id)
      );
    `);
    await applyTableRls(pool, 'account_centers');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'account_centers');
    await pool.query(sql`
      drop table account_centers;
    `);
  },
};

export default alteration;
