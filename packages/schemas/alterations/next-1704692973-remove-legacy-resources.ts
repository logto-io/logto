import { generateStandardId } from '@logto/shared/universal';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Unassign cloud scopes accidentally assigned to the admin Management API proxy
    await pool.query(sql`
      delete from roles_scopes
      using scopes
      where roles_scopes.tenant_id = 'admin'
      and roles_scopes.role_id = 'm-admin'
      and roles_scopes.scope_id = scopes.id
      and scopes.name in ('send:sms', 'send:email', 'create:affiliate', 'manage:affiliate');
    `);
    // Delete all legacy roles in the admin tenant
    await pool.query(sql`
      delete from roles
      where tenant_id = 'admin'
      and name like '%:admin'
      and name not like 'machine:mapi:%'
      and name != 'default:admin';
    `);
    // Update default role description
    await pool.query(sql`
      update roles
      set description = 'Legacy user role for accessing default Management API. Used in OSS only.'
      where tenant_id = 'admin'
      and name = 'default:admin';
    `);
    // Delete `manage:tenant` scope from the Cloud API resource
    await pool.query(sql`
      delete from scopes
      using resources
      where scopes.tenant_id = 'admin'
      and scopes.name = 'manage:tenant'
      and scopes.resource_id = resources.id
      and resources.indicator = 'https://cloud.logto.io/api';
    `);
  },
  down: async (pool) => {
    console.log('Add `manage:tenant` scope to the Cloud API resource');
    // Add `manage:tenant` scope to the Cloud API resource
    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
      values ('admin', 'manage:tenant', 'manage:tenant', 'Allow managing existing tenants, including create without limitation, update, and delete.', (
        select id from resources where tenant_id = 'admin' and indicator = 'https://cloud.logto.io/api'
      ));
    `);
    console.log('Update default role description');
    // Update default role description
    await pool.query(sql`
      update roles
      set description = 'Admin tenant admin role for Logto tenant default.'
      where tenant_id = 'admin'
      and name = 'default:admin';
    `);
    console.log('Add legacy roles in the admin tenant');
    // Add legacy roles in the admin tenant
    const existingTenantIds = await pool.any<{ id: string }>(sql`
      select id from tenants where id != 'default';
    `);
    await pool.query(sql`
      insert into roles (tenant_id, id, name, description)
      values ${sql.join(
        existingTenantIds.map((tenant) => {
          return sql`
            (
              'admin',
              ${`${tenant.id}:admin`},
              ${`${tenant.id}:admin`},
              ${`Admin tenant admin role for Logto tenant ${tenant.id}.`}
            )
          `;
        }),
        sql`, `
      )};
    `);
    console.log('Restore assigned Management API scopes to the legacy roles');
    // Restore assigned Management API scopes to the legacy roles
    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values ${sql.join(
        existingTenantIds.map((tenant) => {
          return sql`
            (
              'admin',
              ${`${tenant.id}:admin`},
              ${`${tenant.id}:admin`},
              (
                select scopes.id from scopes
                join resources on scopes.resource_id = resources.id
                and resources.indicator = ${`https://${tenant.id}.logto.app/api`}
                where scopes.tenant_id = 'admin'
                and scopes.name = 'all'
              )
            )
          `;
        }),
        sql`, `
      )};
    `);
    console.log('Assign to legacy roles to users according to the tenant organization roles');
    // Assign to legacy roles to users according to the tenant organization roles
    const adminUsersOrganizations = await pool.any<{ userId: string; organizationId: string }>(sql`
      select user_id as "userId", organization_id as "organizationId"
      from organization_role_user_relations
      where tenant_id = 'admin'
      and organization_role_id = 'admin'
      and organization_id != 't-default'
      and organization_id like 't-%';
    `);
    await pool.query(sql`
      insert into users_roles (tenant_id, id, user_id, role_id)
      values ${sql.join(
        adminUsersOrganizations.map((relation) => {
          return sql`
            (
              'admin',
              ${`${relation.userId}:${relation.organizationId.slice(2)}:admin`},
              ${relation.userId},
              ${`${relation.organizationId.slice(2)}:admin`}
            )
          `;
        }),
        sql`, `
      )};
    `);
    console.log(
      'Assign back cloud scopes to the admin Management API proxy and the legacy admin user'
    );
    // Assign back cloud scopes to the admin Management API proxy and the legacy admin user
    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
      values ${sql.join(
        ['send:sms', 'send:email', 'create:affiliate', 'manage:affiliate', 'manage:tenant'].map(
          (scope) => {
            return sql`
              (
                'admin',
                ${generateStandardId()},
                'm-admin',
                (
                  select id from scopes
                  where tenant_id = 'admin'
                  and name = ${scope}
                )
              ),
              (
                'admin',
                ${generateStandardId()},
                'admin:admin',
                (
                  select id from scopes
                  where tenant_id = 'admin'
                  and name = ${scope}
                )
              )
            `;
          }
        ),
        sql`, `
      )};
    `);
  },
};

export default alteration;
