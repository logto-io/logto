import {
  adminTenantId,
  createTenantMachineToMachineApplication,
  createAdminTenantApplicationRole,
  createCloudConnectionConfig,
  AdminTenantRole,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

/**
 * Create Cloud Service M2M application for the tenant.
 *
 * This is a built-in M2M application for the tenant to communicate with the cloud service.
 * - default
 * - admin
 */
export const seedTenantCloudServiceApplication = async (
  pool: CommonQueryMethods,
  tenantId: string
) => {
  // Create Cloud Service M2M application
  const cloudServiceApplication = createTenantMachineToMachineApplication(tenantId);
  await pool.query(insertInto(cloudServiceApplication, 'applications'));

  // Assign tenantApplicationRole to Cloud Service M2M application
  const { id: tenantApplicationRoleId } = await pool.one<{ id: string }>(sql`
    select id from roles
    where name = ${AdminTenantRole.TenantApplication}
    and tenant_id = ${adminTenantId}
  `);
  await pool.query(
    insertInto(
      createAdminTenantApplicationRole(cloudServiceApplication.id, tenantApplicationRoleId),
      'applications_roles'
    )
  );

  // Create Cloud Service M2M application logto_config
  await pool.query(
    insertInto(
      createCloudConnectionConfig(
        tenantId,
        cloudServiceApplication.id,
        cloudServiceApplication.secret
      ),
      'logto_configs'
    )
  );

  consoleLog.succeed('Cloud Service Application successfully created for:', tenantId);
};
