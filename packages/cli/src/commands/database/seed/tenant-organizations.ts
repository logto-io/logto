import {
  defaultTenantId,
  adminTenantId,
  Roles,
  Applications,
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
  Scopes,
  Resources,
  PredefinedScope,
  RolesScopes,
  ApplicationsRoles,
} from '@logto/schemas';
import { getMapiProxyM2mApp, getMapiProxyRole } from '@logto/schemas/lib/types/mapi-proxy.js';
import { convertToIdentifiers, generateStandardId } from '@logto/shared';
import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

/**
 * Seed initial data in the admin tenant for tenant organizations:
 *
 * - Organization roles and scopes for tenant management.
 * - Create tenant organizations for the initial tenants (`default` and `admin`).
 *
 * If it is a cloud deployment, it will also seed the following:
 *
 * - Machine-to-machine roles for Management API proxy.
 * - Assign the corresponding Management API scopes to the machine-to-machine roles.
 * - Machine-to-machine applications for Management API proxy.
 * - Assign the roles to the corresponding applications.
 */
export const seedTenantOrganizations = async (
  connection: DatabaseTransactionConnection,
  isCloud: boolean
) => {
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

  if (!isCloud) {
    return;
  }

  // Init Management API proxy roles
  await connection.query(
    insertInto(
      tenantIds.map((tenantId) => getMapiProxyRole(tenantId)),
      Roles.table
    )
  );
  consoleLog.succeed('Created Management API proxy roles');

  // Prepare Management API scopes
  const scopes = convertToIdentifiers(Scopes);
  const resources = convertToIdentifiers(Resources);
  /** Scopes with the name {@link PredefinedScope.All} in all Management API resources. */
  const allScopes = await connection.any<{ id: string; indicator: string }>(sql`
    select ${scopes.fields.id}, ${resources.fields.indicator}
    from ${resources.table}
    join ${scopes.table} on ${scopes.fields.resourceId} = ${resources.fields.id}
    where ${resources.fields.indicator} like 'https://%.logto.app/api'
    and ${scopes.fields.name} = ${PredefinedScope.All}
    and ${resources.fields.tenantId} = ${adminTenantId}
  `);
  const assertScopeId = (forTenantId: string) => {
    const scope = allScopes.find(
      (scope) => scope.indicator === `https://${forTenantId}.logto.app/api`
    );
    if (!scope) {
      throw new Error(`Cannot find Management API scope for tenant '${forTenantId}'.`);
    }
    return scope.id;
  };

  // Assign Management API scopes to the proxy roles
  await connection.query(
    insertInto(
      tenantIds.map((tenantId) => ({
        tenantId: adminTenantId,
        id: generateStandardId(),
        roleId: getMapiProxyRole(tenantId).id,
        scopeId: assertScopeId(tenantId),
      })),
      RolesScopes.table
    )
  );
  consoleLog.succeed('Assigned Management API scopes to the proxy roles');

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
