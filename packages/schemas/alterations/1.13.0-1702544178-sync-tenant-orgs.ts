/**
 * @fileoverview A preparation for the update of using organizations to manage tenants in the admin
 * tenant. This script will do the following in the admin tenant:
 *
 * 1. Create organization template roles and scopes.
 * 2. Create organizations for existing tenants.
 * 3. Add membership records and assign organization roles to existing users.
 * 4. Create machine-to-machine Management API role for each tenant.
 * 5. Create the corresponding machine-to-machine app for each tenant, and assign the Management API role to it.
 *
 * The `down` script will revert the changes.
 *
 * NOTE: In order to avoid unnecessary dirty data, it's recommended disabling the registration of
 * new tenants before running this script and deploying the changes.
 */

import { ConsoleLog, generateStandardId } from '@logto/shared';
import { sql } from '@silverhand/slonik';

import { type AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';
const consoleLog = new ConsoleLog();

const alteration: AlterationScript = {
  up: async (transaction) => {
    consoleLog.info('=== Sync tenant organizations ===');

    consoleLog.info('Create organization template roles and scopes');
    await transaction.query(sql`
      insert into public.organization_roles (id, tenant_id, name, description)
      values
        ('owner', ${adminTenantId}, 'owner', 'Owner of the tenant, who has all permissions.'),
        ('admin', ${adminTenantId}, 'admin', 'Admin of the tenant, who has all permissions except managing the tenant settings.'),
        ('member', ${adminTenantId}, 'member', 'Member of the tenant, who has limited permissions on reading and writing the tenant data.');
    `);
    await transaction.query(sql`
      insert into public.organization_scopes (id, tenant_id, name, description)
      values
        ('read-data', ${adminTenantId}, 'read:data', 'Read the tenant data.'),
        ('write-data', ${adminTenantId}, 'write:data', 'Write the tenant data, including creating and updating the tenant.'),
        ('delete-data', ${adminTenantId}, 'delete:data', 'Delete data of the tenant.'),
        ('invite-member', ${adminTenantId}, 'invite:member', 'Invite members to the tenant.'),
        ('remove-member', ${adminTenantId}, 'remove:member', 'Remove members from the tenant.'),
        ('update-member-role', ${adminTenantId}, 'update:member:role', 'Update the role of a member in the tenant.'),
        ('manage-tenant', ${adminTenantId}, 'manage:tenant', 'Manage the tenant settings, including name, billing, etc.');
    `);
    await transaction.query(sql`
      insert into public.organization_role_scope_relations (tenant_id, organization_role_id, organization_scope_id)
      values
        (${adminTenantId}, 'owner', 'read-data'),
        (${adminTenantId}, 'owner', 'write-data'),
        (${adminTenantId}, 'owner', 'delete-data'),
        (${adminTenantId}, 'owner', 'invite-member'),
        (${adminTenantId}, 'owner', 'remove-member'),
        (${adminTenantId}, 'owner', 'update-member-role'),
        (${adminTenantId}, 'owner', 'manage-tenant'),
        (${adminTenantId}, 'admin', 'read-data'),
        (${adminTenantId}, 'admin', 'write-data'),
        (${adminTenantId}, 'admin', 'delete-data'),
        (${adminTenantId}, 'admin', 'invite-member'),
        (${adminTenantId}, 'admin', 'remove-member'),
        (${adminTenantId}, 'admin', 'update-member-role'),
        (${adminTenantId}, 'member', 'read-data'),
        (${adminTenantId}, 'member', 'write-data'),
        (${adminTenantId}, 'member', 'invite-member')
    `);

    consoleLog.info('Create organizations for existing tenants');
    const tenants = await transaction.any<{ id: string }>(sql`
      select id
      from public.tenants;
    `);
    await transaction.query(sql`
      insert into public.organizations (id, tenant_id, name)
      values 
        ${sql.join(
          tenants.map(
            (tenant) => sql`(${`t-${tenant.id}`}, ${adminTenantId}, ${`Tenant ${tenant.id}`})`
          ),
          sql`, `
        )};
    `);

    const usersRoles = await transaction.any<{ userId: string; roleName: string }>(sql`
      select
        public.users.id as "userId",
        public.roles.name as "roleName"
      from public.users
      join public.users_roles on public.users_roles.user_id = public.users.id
      join public.roles on public.roles.id = public.users_roles.role_id
      where public.roles.tenant_id = ${adminTenantId}
      and public.roles.name like '%:admin';
    `);

    if (usersRoles.length === 0) {
      consoleLog.warn(
        'No existing admin users found, skip adding membership records for tenant organizations.'
      );
    } else {
      consoleLog.info('Add membership records and assign organization roles to existing users');

      // Add membership records
      await transaction.query(sql`
        insert into public.organization_user_relations (tenant_id, organization_id, user_id)
        values 
          ${sql.join(
            usersRoles.map(
              (userRole) =>
                sql`(${adminTenantId}, ${`t-${userRole.roleName.slice(0, -6)}`}, ${
                  userRole.userId
                })`
            ),
            sql`, `
          )};
      `);
      // We treat all existing users as the owner of the tenant
      await transaction.query(sql`
        insert into public.organization_role_user_relations (tenant_id, organization_id, user_id, organization_role_id)
        values 
          ${sql.join(
            usersRoles.map(
              (userRole) =>
                sql`
                  (
                    ${adminTenantId},
                    ${`t-${userRole.roleName.slice(0, -6)}`},
                    ${userRole.userId},
                    'owner'
                  )
                `
            ),
            sql`, `
          )};
      `);
    }

    consoleLog.info('Create machine-to-machine Management API role for each tenant');
    await transaction.query(sql`
      insert into public.roles (id, tenant_id, name, description, type)
      values
        ${sql.join(
          tenants.map(
            (tenant) =>
              sql`
                (
                  ${`m-${tenant.id}`},
                  ${adminTenantId},
                  ${`machine:mapi:${tenant.id}`},
                  ${`Machine-to-machine role for accessing Management API of tenant '${tenant.id}'.`},
                  'MachineToMachine'
                )
              `
          ),
          sql`, `
        )};
    `);

    const managementApiScopes = await transaction.any<{ id: string; indicator: string }>(sql`
      select public.scopes.id, public.resources.indicator
      from public.resources
      join public.scopes on public.scopes.resource_id = public.resources.id
      where public.resources.indicator like 'https://%.logto.app/api'
      and public.scopes.name = 'all'
      and public.resources.tenant_id = ${adminTenantId};
    `);

    const assertScopeId = (forTenantId: string) => {
      const scope = managementApiScopes.find(
        (scope) => scope.indicator === `https://${forTenantId}.logto.app/api`
      );
      if (!scope) {
        throw new Error(`Cannot find Management API scope for tenant '${forTenantId}'.`);
      }
      return scope.id;
    };

    // Insert role - scope relations
    await transaction.query(sql`
      insert into public.roles_scopes (tenant_id, id, role_id, scope_id)
      values 
        ${sql.join(
          tenants.map(
            (tenant) =>
              sql`
                (
                  ${adminTenantId},
                  ${generateStandardId()},
                  ${`m-${tenant.id}`},
                  ${assertScopeId(tenant.id)}
                )
              `
          ),
          sql`, `
        )};
    `);

    consoleLog.info(
      'Create the corresponding machine-to-machine app for each tenant, and assign the Management API role to it'
    );
    await transaction.query(sql`
      insert into public.applications (id, tenant_id, secret, name, description, type, oidc_client_metadata)
      values 
        ${sql.join(
          tenants.map(
            (tenant) =>
              sql`
                (
                  ${`m-${tenant.id}`},
                  ${adminTenantId},
                  ${generateStandardId(32)},
                  ${`Management API access for ${tenant.id}`},
                  ${`Machine-to-machine app for accessing Management API of tenant '${tenant.id}'.`},
                  'MachineToMachine',
                  ${sql.jsonb({
                    redirectUris: [],
                    postLogoutRedirectUris: [],
                  })}
                )
              `
          ),
          sql`, `
        )};
    `);
    await transaction.query(sql`
      insert into public.applications_roles (tenant_id, id, application_id, role_id)
      values 
        ${sql.join(
          tenants.map(
            (tenant) =>
              sql`
                (
                  ${adminTenantId},
                  ${generateStandardId()},
                  ${`m-${tenant.id}`},
                  ${`m-${tenant.id}`}
                )
              `
          ),
          sql`, `
        )};
    `);

    consoleLog.info('=== Sync tenant organizations done ===');
  },
  down: async (transaction) => {
    consoleLog.info('=== Revert sync tenant organizations ===');

    consoleLog.info('Remove machine-to-machine apps');
    await transaction.query(sql`
      delete from public.applications
      where public.applications.tenant_id = ${adminTenantId}
      and public.applications.id like 'm-%';
    `);

    consoleLog.info('Remove machine-to-machine roles');
    await transaction.query(sql`
      delete from public.roles
      where public.roles.tenant_id = ${adminTenantId}
      and public.roles.id like 'm-%';
    `);

    consoleLog.info('Remove organizations');
    await transaction.query(sql`
      delete from public.organizations
      where public.organizations.tenant_id = ${adminTenantId}
      and public.organizations.id like 't-%';
    `);

    consoleLog.info('Remove organization roles');
    await transaction.query(sql`
      delete from public.organization_roles
      where public.organization_roles.tenant_id = ${adminTenantId}
      and public.organization_roles.id in ('owner', 'admin', 'member');
    `);

    consoleLog.info('Remove organization scopes');
    await transaction.query(sql`
      delete from public.organization_scopes
      where public.organization_scopes.tenant_id = ${adminTenantId}
      and public.organization_scopes.id in (
        'read-data',
        'write-data',
        'delete-data',
        'invite-member',
        'remove-member',
        'update-member-role',
        'manage-tenant'
      );
    `);

    consoleLog.info('=== Revert sync tenant organizations done ===');
  },
};

export default alteration;
