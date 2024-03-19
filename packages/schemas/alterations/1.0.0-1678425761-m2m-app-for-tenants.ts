import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';
const adminRoleName = 'admin:admin';

const alteration: AlterationScript = {
  up: async (pool) => {
    const scopeIds = {
      sms: generateStandardId(),
      email: generateStandardId(),
    };
    const { id: resourceId } = await pool.one<{ id: string }>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = 'https://cloud.logto.io/api'
    `);

    // Insert scopes
    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${scopeIds.sms},
          'send:sms',
          'Allow sending SMS. This scope is only available to M2M application.',
          ${resourceId}
        ), (
          ${adminTenantId},
          ${scopeIds.email},
          'send:email',
          'Allow sending emails. This scope is only available to M2M application.',
          ${resourceId}
        );
    `);

    // Insert role
    const roleId = generateStandardId();
    await pool.query(sql`
      insert into roles (tenant_id, id, name, description)
        values (
          ${adminTenantId},
          ${roleId},
          'tenantApplication',
          'The role for M2M applications that represent a user tenant and send requests to Logto Cloud.'
        );
    `);

    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
        values (
          ${adminTenantId},
          ${generateStandardId()},
          ${roleId},
          ${scopeIds.sms}
        ), (
          ${adminTenantId},
          ${generateStandardId()},
          ${roleId},
          ${scopeIds.email}
        );
    `);

    // Insert new scopes to admin role
    const { id: adminRoleId } = await pool.one<{ id: string }>(sql`
      select id from roles
      where name = ${adminRoleName}
      and tenant_id = ${adminTenantId}
    `);
    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
        values (
          ${adminTenantId},
          ${generateStandardId()},
          ${adminRoleId},
          ${scopeIds.sms}
        ), (
          ${adminTenantId},
          ${generateStandardId()},
          ${adminRoleId},
          ${scopeIds.email}
        );
    `);

    // Insert m2m applications for each tenant (except admin tenant)
    const { rows } = await pool.query<{ id: string }>(sql`
      select id from tenants
    `);
    await Promise.all(
      rows.map(async (row) => {
        const tenantId = row.id;

        if (tenantId === adminTenantId) {
          return;
        }

        const applicationId = generateStandardId();
        const description = `Machine to machine application for tenant ${tenantId}`;
        const oidcClientMetadata = { redirectUris: [], postLogoutRedirectUris: [] };
        const customClientMetadata = { tenantId };

        await pool.query(sql`
          insert into applications (tenant_id, id, name, description, secret, type, oidc_client_metadata, custom_client_metadata)
            values (
              'admin',
              ${applicationId},
              'Cloud Service',
              ${description},
              ${generateStandardId()},
              'MachineToMachine',
              ${JSON.stringify(oidcClientMetadata)},
              ${JSON.stringify(customClientMetadata)}
            );
        `);

        await pool.query(sql`
          insert into applications_roles (tenant_id, id, role_id, application_id)
            values (
              'admin',
              ${generateStandardId()},
              ${roleId},
              ${applicationId}
            );
        `);
      })
    );
  },
  down: async (pool) => {
    const role = await pool.one<{ id: string }>(sql`
      select id from roles
        where tenant_id = ${adminTenantId}
        and name='tenantApplication'
    `);
    const { rows: applications } = await pool.query<{ id: string }>(sql`
      select application_id as id from applications_roles
        where tenant_id = ${adminTenantId}
        and role_id = ${role.id}
    `);

    await pool.query(sql`
      delete from applications_roles
        where tenant_id = ${adminTenantId}
        and role_id = ${role.id};
    `);
    await pool.query(sql`
      delete from roles_scopes
        where tenant_id = ${adminTenantId}
        and role_id = ${role.id};
    `);
    await pool.query(sql`
      delete from roles
        where tenant_id = ${adminTenantId}
        and id = ${role.id};
    `);

    if (applications.length > 0) {
      await pool.query(sql`
        delete from applications
          where tenant_id = ${adminTenantId}
          and id in (${sql.join(
            applications.map(({ id }) => id),
            sql`, `
          )});
      `);
    }
    await pool.query(sql`
      delete from scopes
        using resources
        where resources.id = scopes.resource_id
        and scopes.tenant_id = ${adminTenantId}
        and resources.indicator = 'https://cloud.logto.io/api'
        and (scopes.name='send:sms' or scopes.name='send:email');
    `);
  },
};

export default alteration;
