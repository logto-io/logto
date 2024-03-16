import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    /* Drop settings table */
    await pool.query(sql`
      insert into _logto_configs (key, value)
        select 'adminConsole', admin_console from settings
          where id='default';
    `);
    await pool.query(sql`
      alter table _logto_configs
        add column tenant_id varchar(21) not null default 'default'
          references tenants (id) on update cascade on delete cascade;

      create trigger set_tenant_id before insert on _logto_configs
        for each row execute procedure set_tenant_id();
    `);
    await pool.query(sql`
      alter table _logto_configs
        alter column tenant_id drop default;
    `);
    await pool.query(sql`drop table settings cascade;`);

    /* Create systems table */
    await pool.query(sql`
      create table systems (
        key varchar(256) not null,
        value jsonb not null default '{}'::jsonb,
        primary key (key)
      );

      alter table _logto_configs rename to logto_configs;
      alter table logto_configs
        drop constraint _logto_configs_pkey,
        add primary key (tenant_id, key);
      alter table logto_configs
        rename constraint _logto_configs_tenant_id_fkey to logto_configs_tenant_id_fkey;
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
    /* Drop systems table */
    await pool.query(sql`
      insert into logto_configs (key, value)
        select key, value from systems
          where key='alterationState';
      drop table systems;
      alter table logto_configs rename to _logto_configs;
    `);

    /* Restore settings table */
    await pool.query(sql`
      create table settings (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        admin_console jsonb not null,
        primary key (id)
      );

      create index settings__id
        on settings (tenant_id, id);

      create trigger set_tenant_id before insert on settings
        for each row execute procedure set_tenant_id();
    `);

    await pool.query(sql`
      insert into settings (id, admin_console)
        select 'default', value from _logto_configs
          where key='adminConsole';
    `);

    await pool.query(sql`
      delete from _logto_configs
        where key='adminConsole';
    `);

    await pool.query(sql`
      drop trigger set_tenant_id on _logto_configs; 

      alter table _logto_configs
        drop constraint logto_configs_pkey,
        drop column tenant_id cascade,
        add primary key (key);
    `);
  },
};

export default alteration;
