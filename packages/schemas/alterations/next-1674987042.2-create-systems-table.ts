import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table systems (
        key varchar(256) not null,
        value jsonb not null default '{}'::jsonb,
        primary key (key)
      );

      alter table _logto_configs rename to logto_configs;
    `);

    await pool.query(sql`
      insert into systems (key, value)
        select key, value from logto_configs
          where key='alterationState';
    `);

    await pool.query(sql`
      delete from logto_configs
        where key='alterationState';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      insert into _logto_configs (key, value)
        select key, value from systems
          where key='alterationState';
      drop table systems;
      alter table logto_configs rename to _logto_configs;
    `);
  },
};

export default alteration;
