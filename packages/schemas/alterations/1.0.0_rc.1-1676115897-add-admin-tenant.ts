import { generateStandardId } from '@logto/shared/universal';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const addManagementApiData = async (pool: CommonQueryMethods) => {
  const resourceId = generateStandardId();
  const roleId = generateStandardId();
  const scopeId = generateStandardId();

  await pool.query(sql`
    insert into resources (tenant_id, id, indicator, name)
      values (
        ${adminTenantId},
        ${resourceId},
        'https://default.logto.app/api',
        'Logto Management API for tenant default'
      );
  `);
  await pool.query(sql`
    insert into scopes (tenant_id, id, name, description, resource_id)
      values (
        ${adminTenantId},
        ${scopeId},
        'all',
        'Default scope for Management API, allows all permissions.',
        ${resourceId}
      );
  `);
  await pool.query(sql`
    insert into roles (tenant_id, id, name, description)
      values (
        ${adminTenantId},
        ${roleId},
        'default:admin',
        'Admin role for Logto.'
      );
  `);
  await pool.query(sql`
    insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values (
        ${adminTenantId},
        ${generateStandardId()},
        ${roleId},
        ${scopeId}
      );
  `);
};

const addMeApiData = async (pool: CommonQueryMethods) => {
  const resourceId = generateStandardId();
  const roleId = generateStandardId();
  const scopeId = generateStandardId();

  await pool.query(sql`
    insert into resources (tenant_id, id, indicator, name)
      values (
        ${adminTenantId},
        ${resourceId},
        'https://admin.logto.app/me',
        'Logto Me API'
      );
  `);
  await pool.query(sql`
    insert into scopes (tenant_id, id, name, description, resource_id)
      values (
        ${adminTenantId},
        ${scopeId},
        'all',
        'Default scope for Me API, allows all permissions.',
        ${resourceId}
      );
  `);
  await pool.query(sql`
    insert into roles (tenant_id, id, name, description)
      values (
        ${adminTenantId},
        ${roleId},
        'user',
        'Default role for admin tenant.'
      );
  `);
  await pool.query(sql`
    insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values (
        ${adminTenantId},
        ${generateStandardId()},
        ${roleId},
        ${scopeId}
      );
  `);
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);

    // Update function
    await pool.query(sql`
      create or replace function set_tenant_id() returns trigger as
      $$ begin
        if new.tenant_id is not null then
          return new;
        end if;

        select tenants.id into new.tenant_id
          from tenants
          where tenants.db_user = current_user;

        return new;
      end; $$ language plpgsql;
    `);

    // Update users table constraint
    await pool.query(sql`
      alter table users
        drop constraint users_username_key,
        add constraint users__username unique (tenant_id, username),
        drop constraint users_primary_email_key,
        add constraint users__primary_email unique (tenant_id, primary_email),
        drop constraint users_primary_phone_key,
        add constraint users__primary_phone unique (tenant_id, primary_phone);
    `);

    // Update old resource
    await pool.query(sql`
      update resources
        set indicator = 'https://default.logto.app/api'
        where indicator = 'https://api.logto.io';
    `);

    // Create admin tenant
    const baseRole = `logto_tenant_${database}`;
    const role = `logto_tenant_${database}_${adminTenantId}`;
    const password = generateStandardId(32);

    await pool.query(sql`
      insert into tenants (id, db_user, db_user_password)
        values (${adminTenantId}, ${role}, ${password});
    `);
    await pool.query(sql`
      create role ${getId(role)} with inherit login
        password '${sql.raw(password)}'
        in role ${getId(baseRole)};
    `);

    await addManagementApiData(pool);
    await addMeApiData(pool);
  },
  down: async (pool) => {
    const database = await getDatabaseName(pool);
    const role = `logto_tenant_${database}_${adminTenantId}`;

    // Drop role and tenant
    await pool.query(sql`
      drop role ${getId(role)};
    `);
    await pool.query(sql`
      delete from tenants where id = ${adminTenantId};
    `);

    // Restore users table constraint
    await pool.query(sql`
      alter table users
        drop constraint users__username,
        add constraint users_username_key unique (username),
        drop constraint users__primary_email,
        add constraint users_primary_email_key unique (primary_email),
        drop constraint users__primary_phone,
        add constraint users_primary_phone_key unique (primary_phone);
    `);

    // Restore old resource
    await pool.query(sql`
      update resources
      set indicator = 'https://api.logto.io'
        where indicator = 'https://default.logto.app/api';
    `);

    // Update function
    await pool.query(sql`
      create or replace function set_tenant_id() returns trigger as
      $$ begin
        select tenants.id into new.tenant_id
            from tenants
            where ('tenant_user_' || tenants.id) = current_user;

        if new.tenant_id is null then
            new.tenant_id := 'default';
        end if;

        return new;
      end; $$ language plpgsql;
    `);
  },
};

export default alteration;
