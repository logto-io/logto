import {
  adminConsoleApplicationId,
  adminTenantId,
  defaultTenantId,
  createTenantMachineToMachineApplication,
  createAdminTenantApplicationRole,
  createCloudConnectionConfig,
  AdminTenantRole,
  CloudScope,
  cloudApiIndicator,
  RoleType,
  ApplicationType,
  type CreateApplication,
  type CreateRole,
  type CreateScope,
  type CreateApplicationsRole,
} from '@logto/schemas';
import { GlobalValues, generateStandardId, generateStandardSecret } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { insertInto } from '../../../database.js';
import { consoleLog } from '../../../utils.js';

import { assignScopesToRole } from './tenant.js';

/**
 * Append Redirect URIs for the default tenant callback in cloud Admin Console.
 * It reads the same env variables as core to construct the cloud `UrlSet`.
 *
 * E.g., by default, it will appends `http://localhost:3003/default/callback` to the Redirect URIs.
 *
 * For why it is necessary, see the redirect lifecycle of cloud Admin Console.
 */
export const appendAdminConsoleRedirectUris = async (pool: CommonQueryMethods) => {
  const redirectUris = new GlobalValues().cloudUrlSet
    .deduplicated()
    .flatMap((endpoint) =>
      [defaultTenantId, adminTenantId].map((tenantId) => appendPath(endpoint, tenantId, 'callback'))
    );

  const metadataKey = sql.identifier(['oidc_client_metadata']);

  // Copied from packages/cloud/src/queries/tenants.ts
  // Can be merged into the original once we remove slonik
  await pool.query(sql`
    update applications
    set ${metadataKey} = jsonb_set(
      ${metadataKey},
      '{redirectUris}',
      (select jsonb_agg(distinct value) from jsonb_array_elements(
        ${metadataKey}->'redirectUris' || ${sql.jsonb(redirectUris.map(String))}
      ))
    )
    where id = ${adminConsoleApplicationId}
    and tenant_id = ${adminTenantId}
  `);

  consoleLog.succeed('Appended initial Redirect URIs to Admin Console:', redirectUris.map(String));
};

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

/**
 * Setup Logs Pruner application for admin tenant
 */
export const setupLogsPrunerApplicationForAdminTenant = async (pool: CommonQueryMethods) => {
  // Add CloudScope.PruneLogs scope to cloud api resource
  const { id: cloudApiResourceId } = await pool.one<{ id: string }>(sql`
    select id from resources
    where indicator = ${cloudApiIndicator}
    and tenant_id = ${adminTenantId}
  `);

  const pruneLogsScope: CreateScope = {
    tenantId: adminTenantId,
    id: generateStandardId(),
    name: CloudScope.PruneLogs,
    description:
      'Allow pruning logs which are expired. This scope is only available to Logs Pruner M2M application.',
    resourceId: cloudApiResourceId,
  };

  await pool.query(insertInto(pruneLogsScope, 'scopes'));

  // Create logs pruner role
  const logsPrunerRole: CreateRole = {
    tenantId: adminTenantId,
    id: generateStandardId(),
    name: 'logs-pruner',
    description: 'The role for the application that prunes logs which are expired.',
    type: RoleType.MachineToMachine,
  };
  await pool.query(insertInto(logsPrunerRole, 'roles'));

  // Assign CloudScope.PruneLogs to logsPruner role
  await assignScopesToRole(pool, adminTenantId, logsPrunerRole.id, pruneLogsScope.id);

  // Create Logs Pruner M2M application
  const logsPrunerApplication: CreateApplication = {
    tenantId: adminTenantId,
    id: generateStandardId(),
    name: 'Logs Pruner',
    description: 'The application that prunes logs which are expired.',
    type: ApplicationType.MachineToMachine,
    secret: generateStandardSecret(),
    oidcClientMetadata: {
      redirectUris: [],
      postLogoutRedirectUris: [],
    },
    customClientMetadata: {},
  };
  await pool.query(insertInto(logsPrunerApplication, 'applications'));

  // Assign logs-pruner role to Logs Pruner application
  const applicationRoleRelation: CreateApplicationsRole = {
    id: generateStandardId(),
    tenantId: adminTenantId,
    applicationId: logsPrunerApplication.id,
    roleId: logsPrunerRole.id,
  };
  await pool.query(insertInto(applicationRoleRelation, 'applications_roles'));

  consoleLog.succeed(
    'Logs Pruner machine-to-machine application successfully setup for admin tenant'
  );
};
