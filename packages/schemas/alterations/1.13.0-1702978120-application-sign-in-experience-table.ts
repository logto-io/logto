import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

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
      create table application_sign_in_experiences (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        branding jsonb /* @use Branding */ not null default '{}'::jsonb,
        terms_of_use_url varchar(2048),
        privacy_policy_url varchar(2048),
        display_name varchar(256),

        primary key (tenant_id, application_id)
      );
    `);

    await enableRls(pool, database, 'application_sign_in_experiences');
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table application_sign_in_experiences;
    `);
  },
};

export default alteration;
