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
      create table organizations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the organization. */
        id varchar(21) not null,
        /** The organization's name for display. */
        name varchar(128) not null,
        /** A brief description of the organization. */
        description varchar(256),
        /** When the organization was created. */
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index organizations__id
        on organizations (tenant_id, id);
    `);
    await enableRls(pool, database, 'organizations');

    await pool.query(sql`
      create table organization_roles (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the organization role. */
        id varchar(21) not null,
        /** The organization role's name, unique within the organization template. */
        name varchar(128) not null,
        /** A brief description of the organization role. */
        description varchar(256),
        primary key (id),
        constraint organization_roles__name
          unique (tenant_id, name)
      );

      create index organization_roles__id
        on organization_roles (tenant_id, id);
    `);
    await enableRls(pool, database, 'organization_roles');

    await pool.query(sql`
      create table organization_scopes (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The globally unique identifier of the organization scope. */
        id varchar(21) not null,
        /** The organization scope's name, unique within the organization template. */
        name varchar(128) not null,
        /** A brief description of the organization scope. */
        description varchar(256),
        primary key (id),
        constraint organization_scopes__name
          unique (tenant_id, name)
      );

      create index organization_scopes__id
        on organization_scopes (tenant_id, id);
    `);
    await enableRls(pool, database, 'organization_scopes');

    await pool.query(sql`
      create table organization_role_user_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_id, organization_role_id, user_id)
      );
    `);
    await enableRls(pool, database, 'organization_role_user_relations');

    await pool.query(sql`
      create table organization_role_scope_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        organization_scope_id varchar(21) not null
          references organization_scopes (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_role_id, organization_scope_id)
      );
    `);
    await enableRls(pool, database, 'organization_role_scope_relations');

    await pool.query(sql`
      create table organization_user_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        organization_id varchar(21) not null
          references organizations (id) on update cascade on delete cascade,
        user_id varchar(21) not null
          references users (id) on update cascade on delete cascade,
        primary key (tenant_id, organization_id, user_id)
      );
    `);
    await enableRls(pool, database, 'organization_user_relations');
  },
  down: async (pool) => {
    await pool.query(sql`
      drop table organization_role_scope_relations;
      drop table organization_role_user_relations;
      drop table organization_scopes;
      drop table organization_roles;
      drop table organization_user_relations;
      drop table organizations;
    `);
  },
};

export default alteration;
