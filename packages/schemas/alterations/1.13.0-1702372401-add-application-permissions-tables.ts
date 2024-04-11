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
        create table application_user_consent_resource_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the application. */
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        /** The globally unique identifier of the resource scope. */
        scope_id varchar(21) not null
          references scopes (id) on update cascade on delete cascade,
        primary key (application_id, scope_id)
      );
    `);

    await enableRls(pool, database, 'application_user_consent_resource_scopes');

    await pool.query(sql`
      create table application_user_consent_organization_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the application. */
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        /** The globally unique identifier of the organization scope. */
        organization_scope_id varchar(21) not null
          references organization_scopes (id) on update cascade on delete cascade,
        primary key (application_id, organization_scope_id)
      );
    `);

    await enableRls(pool, database, 'application_user_consent_organization_scopes');

    await pool.query(sql`
      create table application_user_consent_user_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the application. */
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        /** The unique UserScope enum value @see (@logto/core-kit) for reference */
        user_scope varchar(64) not null,
        primary key (application_id, user_scope)
      );
    `);

    await enableRls(pool, database, 'application_user_consent_user_scopes');
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table application_user_consent_resource_scopes;
      drop table application_user_consent_organization_scopes;
      drop table application_user_consent_user_scopes;
    `);
  },
};

export default alteration;
