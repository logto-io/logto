import { createTenantDatabaseMetadata } from '@logto/core-kit';
import {
  type AdminData,
  type UpdateAdminData,
  type CreateScope,
  type CreateRolesScope,
  defaultTenantId,
  adminTenantId,
  Applications,
  ApplicationsRoles,
  getMapiProxyM2mApp,
  getMapiProxyRole,
  defaultManagementApiAdminName,
  Roles,
  PredefinedScope,
  getManagementApiResourceIndicator,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import type { CommonQueryMethods, DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { getDatabaseName } from '../../../queries/database.js';
import { consoleLog } from '../../../utils.js';

export { assignScopesToRole, createTenant, seedAdminData } from '@logto/tenant-seed';

/**
 * For each initial tenant (`default` and `admin`), create a machine-to-machine application for
 * Management API proxy and assign the corresponding proxy role to it.
 */
export const seedManagementApiProxyApplications = async (
  connection: DatabaseTransactionConnection
) => {
  const tenantIds = [defaultTenantId, adminTenantId];

  // Create machine-to-machine applications for Management API proxy
  await connection.query(
    insertInto(
      tenantIds.map((tenantId) => getMapiProxyM2mApp(tenantId)),
      Applications.table
    )
  );
  consoleLog.succeed('Created machine-to-machine applications for Management API proxy');

  // Assign the proxy roles to the applications
  await connection.query(
    insertInto(
      tenantIds.map((tenantId) => ({
        tenantId: adminTenantId,
        id: generateStandardId(),
        applicationId: getMapiProxyM2mApp(tenantId).id,
        roleId: getMapiProxyRole(tenantId).id,
      })),
      ApplicationsRoles.table
    )
  );
  consoleLog.succeed('Assigned the proxy roles to the applications');
};

/**
 * Seed the legacy user role for accessing default Management API, and assign the `all` scope to
 * it. Used in OSS only.
 */
export const seedLegacyManagementApiUserRole = async (
  connection: DatabaseTransactionConnection
) => {
  const roleId = generateStandardId();
  await connection.query(
    insertInto(
      {
        tenantId: adminTenantId,
        id: roleId,
        name: defaultManagementApiAdminName,
        description: 'Legacy user role for accessing default Management API. Used in OSS only.',
      },
      Roles.table
    )
  );
  await connection.query(sql`
    insert into roles_scopes (id, role_id, scope_id, tenant_id)
    values (
      ${generateStandardId()},
      ${roleId},
      (
        select scopes.id from scopes
        join resources on scopes.resource_id = resources.id
        where resources.indicator = ${getManagementApiResourceIndicator(defaultTenantId)}
        and scopes.name = ${PredefinedScope.All}
        and scopes.tenant_id = ${adminTenantId}
      ),
      ${adminTenantId}
    );
  `);
};
