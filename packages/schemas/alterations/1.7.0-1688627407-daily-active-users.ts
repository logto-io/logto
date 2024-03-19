import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = getId(`logto_tenant_${database}`);

    await pool.query(sql`
      create table daily_active_users (
        id varchar(21) not null,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        user_id varchar(21) not null,
        date timestamptz not null,
        primary key (id),
        constraint daily_active_users__user_id_date
          unique (user_id, date)
      );

      create index daily_active_users__id
        on daily_active_users (tenant_id, id);

      create trigger set_tenant_id before insert on daily_active_users
        for each row execute procedure set_tenant_id();

      alter table daily_active_users enable row level security;

      create policy daily_active_users_tenant_id on daily_active_users
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));
      create policy daily_active_users_modification on daily_active_users
        using (true);

      grant select, insert, update, delete on daily_active_users to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy daily_active_users_tenant_id on daily_active_users;
      drop policy daily_active_users_modification on daily_active_users;

      alter table daily_active_users disable row level security;

      drop table daily_active_users;
    `);
  },
};

export default alteration;
