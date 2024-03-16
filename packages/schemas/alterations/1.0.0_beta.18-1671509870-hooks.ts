import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table hooks (
        id varchar(32) not null,
        event varchar(128) not null,
        config jsonb /* @use HookConfig */ not null,
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index hooks__event on hooks (event);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table hooks;
    `);
  },
};

export default alteration;
