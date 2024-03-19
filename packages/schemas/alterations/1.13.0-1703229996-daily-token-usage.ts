import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const enableRls = async (pool: CommonQueryMethods, database: string, table: string) => {
  const baseRoleId = sql.identifier([`logto_tenant_${database}`]);

  await pool.query(sql`
    create trigger set_tenant_id before insert on ${sql.identifier([table])}
      for each row execute procedure set_tenant_id();

    alter table ${sql.identifier([table])} enable row level security;

    create policy ${sql.identifier([`${table}_tenant_id`])} on ${sql.identifier([table])}
      as restrictive
      using (tenant_id = (select id from tenants where db_user = current_user));

    create policy ${sql.identifier([`${table}_modification`])} on ${sql.identifier([table])}
      using (true);

    grant select, insert, update, delete on ${sql.identifier([table])} to ${baseRoleId};
  `);
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);

    await pool.query(sql`
      create table daily_token_usage (
        id varchar(21) not null,
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        usage bigint not null default(0),
        date timestamptz not null,
        primary key (id)
      );

      create unique index daily_token_usage__date
        on daily_token_usage (tenant_id, date);
    `);

    await enableRls(pool, database, 'daily_token_usage');
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table daily_token_usage;
    `);
  },
};

export default alteration;
