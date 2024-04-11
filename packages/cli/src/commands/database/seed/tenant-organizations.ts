import {
  defaultTenantId,
  adminTenantId,
  OrganizationRoles,
  TenantRole,
  getTenantScope,
  OrganizationScopes,
  TenantScope,
  getTenantRole,
  OrganizationRoleScopeRelations,
  tenantRoleScopes,
  getTenantOrganizationCreateData,
  Organizations,
} from '@logto/schemas';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

/**
 * Seed initial data in the admin tenant for tenant organizations (`default` and `admin`):
 *
 * - Organization roles and scopes for tenant management.
 * - Create tenant organizations for the initial tenants (`default` and `admin`).
 */
export const seedTenantOrganizations = async (connection: DatabaseTransactionConnection) => {
  const tenantIds = [defaultTenantId, adminTenantId];

  // Init organization template
  await Promise.all([
    connection.query(
      insertInto(
        Object.values(TenantRole).map((role) => getTenantRole(role)),
        OrganizationRoles.table
      )
    ),
    connection.query(
      insertInto(
        Object.values(TenantScope).map((scope) => getTenantScope(scope)),
        OrganizationScopes.table
      )
    ),
  ]);

  // Link organization roles and scopes
  await connection.query(
    insertInto(
      Object.entries(tenantRoleScopes).flatMap(([role, scopes]) =>
        scopes.map((scope) => ({
          tenantId: adminTenantId,
          // eslint-disable-next-line no-restricted-syntax -- `Object.entries` converts the enum to string
          organizationRoleId: getTenantRole(role as TenantRole).id,
          organizationScopeId: getTenantScope(scope).id,
        }))
      ),
      OrganizationRoleScopeRelations.table
    )
  );
  consoleLog.succeed('Initialized tenant organization template');

  // Init tenant organizations
  await connection.query(
    insertInto(
      tenantIds.map((id) => getTenantOrganizationCreateData(id)),
      Organizations.table
    )
  );
  consoleLog.succeed('Created tenant organizations');
};
