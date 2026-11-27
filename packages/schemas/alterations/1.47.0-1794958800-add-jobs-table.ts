import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table jobs (
        tenant_id varchar(64) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        type varchar(64) not null,
        group_key varchar(128) not null,
        dedupe_key varchar(128),
        payload text not null default '',
        attempts int2 not null default 0,
        next_attempt_at timestamptz not null default (now()),
        claimed_by varchar(21),
        created_at timestamptz not null default (now()),
        primary key (id)
      );

      create index jobs__next_attempt_at
        on jobs (next_attempt_at);

      create index jobs__type_group_key
        on jobs (tenant_id, type, group_key);

      create unique index jobs__type_dedupe_key
        on jobs (tenant_id, type, dedupe_key)
        where dedupe_key is not null;

      alter table jobs set (
        autovacuum_vacuum_scale_factor = 0.01,
        autovacuum_analyze_scale_factor = 0.01,
        autovacuum_vacuum_threshold = 1000,
        autovacuum_analyze_threshold = 500
      );
    `);

    await applyTableRls(pool, 'jobs');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'jobs');

    await pool.query(sql`
      drop table jobs;
    `);
  },
};

export default alteration;
