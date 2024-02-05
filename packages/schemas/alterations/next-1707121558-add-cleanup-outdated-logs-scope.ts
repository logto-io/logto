/**
 * @fileoverview A preparation for the audit log cleanup task.
 *
 * This scripts will do the following things:
 * 1. Add a new scope `cleanup:outdated-logs` to the cloud api resource.
 * 2. Assign the new scope to the `tenantApplication` role, which is the role for cloud service M2M application.
 *
 * The `cleanup:outdated-logs` scope is used to control the access to the audit log cleanup task provided by the cloud api.
 *
 * The `down` script will remove the role-scope assignment and the scope itself.
 */
import { generateStandardId } from '@logto/shared/universal';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';
const cloudApiIndicator = 'https://cloud.logto.io/api';

const cleanupOutdatedLogsScopeName = 'cleanup:outdated-logs';
const cleanupOutdatedLogsScopeDescription =
  'Allow cleaning up outdated logs. This scope is only available to M2M application.';

const tenantApplicationRole = 'tenantApplication';

const alteration: AlterationScript = {
  up: async (pool) => {
    const scopeId = generateStandardId();

    const { id: resourceId } = await pool.one<{ id: string }>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    // Add scope to cloud api resource
    await pool.query(sql`
      insert into scopes (tenant_id, id, name, description, resource_id)
        values (
          ${adminTenantId},
          ${scopeId},
          ${cleanupOutdatedLogsScopeName},
          ${cleanupOutdatedLogsScopeDescription},
          ${resourceId}
        );
    `);

    // Assign scope to the tenant application role
    const { id: tenantAppRoleId } = await pool.one<{ id: string }>(sql`
      select id from roles where tenant_id = ${adminTenantId} and name = ${tenantApplicationRole}
    `);
    await pool.query(sql`
      insert into roles_scopes (tenant_id, id, role_id, scope_id)
        values (
          ${adminTenantId},
          ${generateStandardId()},
          ${tenantAppRoleId},
          ${scopeId}
        );
    `);
  },
  down: async (pool) => {
    const { id: resourceId } = await pool.one<{ id: string }>(sql`
      select id from resources
      where tenant_id = ${adminTenantId}
      and indicator = ${cloudApiIndicator}
    `);

    const { id: scopeId } = await pool.one<{ id: string }>(sql`
      select id from scopes
      where tenant_id = ${adminTenantId}
      and name = ${cleanupOutdatedLogsScopeName}
      and resource_id = ${resourceId}
    `);

    const { id: tenantAppRoleId } = await pool.one<{ id: string }>(sql`
      select id from roles where tenant_id = ${adminTenantId} and name = ${tenantApplicationRole}
    `);

    // Remove scope from tenant application role
    await pool.query(sql`
      delete from roles_scopes
      where
        tenant_id = ${adminTenantId}
        and role_id = ${tenantAppRoleId}
        and scope_id = ${scopeId}
    `);

    // Remove scope
    await pool.query(sql`
      delete from scopes
      where
        tenant_id = ${adminTenantId}
        and id = ${scopeId}
        and resource_id = ${resourceId};
    `);
  },
};

export default alteration;
