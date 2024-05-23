import {
  PredefinedScope,
  getManagementApiResourceIndicator,
  createPreConfiguredManagementApiAccessRole,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';

/**
 * Create a pre-configured role with Management API access
 *
 * Caution:
 * This function should only be called after the tenant's Management API resource and the related all scope have been created.
 */
export const seedPreConfiguredManagementApiAccessRole = async (
  pool: CommonQueryMethods,
  tenantId: string
) => {
  const role = createPreConfiguredManagementApiAccessRole(tenantId);

  await pool.query(insertInto(role, 'roles'));

  // Assign Logto Management API permission `all` to the Logto Management API M2M role
  await pool.query(sql`
    insert into roles_scopes (id, role_id, scope_id, tenant_id)
    values (
      ${generateStandardId()},
      ${role.id},
      (
        select scopes.id
        from scopes
        join resources on
          scopes.tenant_id = resources.tenant_id and
          scopes.resource_id = resources.id
        where resources.indicator = ${getManagementApiResourceIndicator(tenantId)}
        and scopes.name = ${PredefinedScope.All}
        and scopes.tenant_id = ${tenantId}
      ),
      ${tenantId}
    )
  `);
};
