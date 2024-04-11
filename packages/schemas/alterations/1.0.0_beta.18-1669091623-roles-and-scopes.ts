import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      -- scopes
      create table scopes (
        id varchar(21) not null,
        resource_id varchar(21) references resources (id) on update cascade on delete cascade,
        name varchar(256) not null,
        description text,
        created_at timestamptz not null default(now()),
        primary key (id)
      );
      -- update table roles, add id and replace pkey
      alter table roles add column id varchar(21);
      update roles set id = name;
      alter table roles alter column id set not null;
      alter table roles drop constraint roles_pkey;
      create unique index roles_pkey on roles using btree(id);
      create unique index roles__name on roles (name);
      -- roles_scopes
      create table roles_scopes (
        role_id varchar(21) references roles (id) on update cascade on delete cascade,
        scope_id varchar(21) references scopes (id) on update cascade on delete cascade,
        constraint roles_permissison_pkey primary key (role_id, scope_id)
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table roles_scopes cascade;
      drop table scopes cascade;
      alter table roles
        drop constraint if exists roles_pkey,
        drop column id,
        add primary key (name);
      drop index roles__name;
    `);
  },
};

export default alteration;
