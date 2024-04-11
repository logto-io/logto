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
      create table application_user_consent_organizations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        organization_id varchar(21) not null,
        user_id varchar(21) not null,
        primary key (tenant_id, application_id, organization_id, user_id),
        /** User's consent to an application should be synchronized with the user's membership in the organization. */
        foreign key (tenant_id, organization_id, user_id)
          references organization_user_relations (tenant_id, organization_id, user_id)
          on update cascade on delete cascade
      )
    `);

    await enableRls(pool, database, 'application_user_consent_organizations');
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table application_user_consent_organizations;
    `);
  },
};

export default alteration;
