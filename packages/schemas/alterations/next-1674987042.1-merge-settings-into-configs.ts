import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
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
  },
  down: async (pool) => {
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
      alter table _logto_configs
        drop column tenant_id,
        drop trigger set_tenant_id;
    `);
  },
};

export default alteration;
