import { generateStandardId } from '@logto/shared/universal';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

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
          references tenants (id) on update cascade on delete cascade,
        alter column id type varchar(21); -- OK to downsize since we use length 21 for ID generation in core

      alter table hooks
        alter column tenant_id drop default;

      create index hooks__id on hooks (tenant_id, id);

      drop index hooks__event;
      create index hooks__event on hooks (tenant_id, event);

      create trigger set_tenant_id before insert on hooks
        for each row execute procedure set_tenant_id();
    `);

    // Add db_user column to tenants table
    await pool.query(sql`
      alter table tenants
        add column db_user varchar(128),
        add constraint tenants__db_user
          unique (db_user);
    `);

    // Create role and setup privileges
    const baseRole = `logto_tenant_${database}`;
    const baseRoleId = getId(baseRole);

    // See `_after_all.sql` for comments
    await pool.query(sql`
      create role ${baseRoleId} noinherit;

      grant select, insert, update, delete
        on all tables
        in schema public
        to ${baseRoleId};

      revoke all privileges
        on table tenants
        from ${baseRoleId};

      grant select (id, db_user)
        on table tenants
        to ${baseRoleId};

      alter table tenants enable row level security;

      create policy tenants_tenant_id on tenants
        to ${baseRoleId}
        using (db_user = current_user);

      revoke all privileges
        on table systems
        from ${baseRoleId};
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
        password '${sql.raw(password)}'
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

      drop policy tenants_tenant_id on tenants;
      alter table tenants disable row level security;

      drop role ${baseRoleId};
    `);

    // Drop db_user column from tenants table
    await pool.query(sql`
      alter table tenants
        drop column db_user;
    `);

    // Revert hooks table from multi-tenancy
    await pool.query(sql`
      drop index hooks__id;

      alter table hooks
        drop column tenant_id,
        alter column id type varchar(32);

      create index hooks__event on hooks (event);

      drop trigger set_tenant_id on hooks;
    `);
  },
};

export default alteration;
