import { generateStandardId } from '@logto/core-kit';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';
import { raw } from 'slonik-sql-tag-raw';

import type { AlterationScript } from '../lib/types/alteration.js';

const tables: string[] = [
  'applications_roles',
  'applications',
  'connectors',
  'custom_phrases',
  'logs',
  'logto_configs',
  'oidc_model_instances',
  'passcodes',
  'resources',
  'roles_scopes',
  'roles',
  'scopes',
  'sign_in_experiences',
  'users_roles',
  'users',
  'hooks',
];

const defaultTenantId = 'default';

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

    // Alter hooks table for multi-tenancy (missed before)
    await pool.query(sql`
      alter table hooks
        add column tenant_id varchar(21) not null default 'default'
          references tenants (id) on update cascade on delete cascade;
      alter table hooks
        alter column tenant_id drop default;
      create index hooks__id on hooks (tenant_id, id);
    `);

    // Create role and setup privileges
    const baseRole = `logto_tenant_${database}`;
    const baseRoleId = getId(baseRole);
    await pool.query(sql`
      create role ${baseRoleId} noinherit;

      grant select, insert, update, delete
        on all tables
        in schema public
        to ${baseRoleId};

      revoke all privileges
        on table tenants
        from ${baseRoleId};

      revoke all privileges
        on table systems
        from ${baseRoleId};
    `);

    // Add db_user column to tenants table
    await pool.query(sql`
      alter table tenants
        add column db_user varchar(128),
        add constraint tenants__db_user
          unique (db_user);
    `);

    // Enable RLS
    await Promise.all(
      tables.map(async (tableName) =>
        pool.query(sql`
          alter table ${getId(tableName)} enable row level security;

          create policy ${getId(`${tableName}_tenant_id`)} on ${getId(tableName)}
            to ${baseRoleId}
            using (tenant_id = (select id from tenants where db_user = current_user));
        `)
      )
    );

    // Create database role for default tenant
    const role = `logto_tenant_${database}_${defaultTenantId}`;
    const password = generateStandardId(32);

    await pool.query(sql`
      update tenants
        set db_user=${role}, db_user_password=${password}
        where id=${defaultTenantId};
    `);
    await pool.query(sql`
      create role ${sql.identifier([role])} with inherit login
        password '${raw(password)}'
        in role ${sql.identifier([baseRole])};
    `);
  },
  down: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = getId(`logto_tenant_${database}`);
    const role = `logto_tenant_${database}_${defaultTenantId}`;

    // Disable RLS
    await Promise.all(
      tables.map(async (tableName) =>
        pool.query(sql`
          drop policy ${getId(`${tableName}_tenant_id`)} on ${getId(tableName)};
          alter table ${getId(tableName)} disable row level security;
        `)
      )
    );

    // Drop role
    await pool.query(sql`
      drop role ${getId(role)};

      revoke all privileges
        on all tables
        in schema public
        from ${baseRoleId};

      drop role ${baseRoleId};
    `);

    // Drop db_user column from tenants table
    await pool.query(sql`
      alter table tenants
        drop column db_user;
    `);

    console.log('3');
    // Revert hooks table from multi-tenancy
    await pool.query(sql`
      drop index hooks__id;

      alter table hooks
        drop column tenant_id;
    `);
  },
};

export default alteration;
