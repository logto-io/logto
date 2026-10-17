import {
  AccountCenters,
  createAdminData,
  createDefaultAccountCenter,
  createDefaultAdminConsoleConfig,
  createDefaultIdTokenConfig,
  createDefaultSignInExperience,
  LogtoConfigs,
  SignInExperiences,
} from '@logto/schemas';
import type { DatabaseTransactionConnection } from '@silverhand/slonik';

import { seedOidcConfigs } from './oidc-config.js';
import { seedPreConfiguredManagementApiAccessRole } from './roles.js';
import { insertInto } from './insert-into.js';
import { createTenant, seedAdminData, type TenantMetadata } from './tenant.js';

/**
 * Seed a tenant created at runtime, for any tenant ID. Unlike `seedTables`, which only seeds the
 * fixed `default` and `admin` tenants, every resource here is built from `tenantId`.
 *
 * Order matters: the tenant row and role come first, then the OIDC configs, then the Management
 * API resource and scopes, then the role that grants access to them.
 */
export const seedTenant = async (
  connection: DatabaseTransactionConnection,
  tenantId: string,
  metadata: TenantMetadata = {}
) => {
  await createTenant(connection, tenantId, metadata);
  await seedOidcConfigs(connection, tenantId);
  // The console and token settings every tenant reads on sign-in, matching the default tenant's seed.
  await connection.query(insertInto(createDefaultAdminConsoleConfig(tenantId), LogtoConfigs.table));
  await connection.query(insertInto(createDefaultIdTokenConfig(tenantId), LogtoConfigs.table));
  // The sign-in experience and account center applications read on creation, matching the default.
  // Local cloud is not a Cloud-hosted tenant, so it is seeded as a non-cloud instance.
  await connection.query(
    insertInto(createDefaultSignInExperience(tenantId, false), SignInExperiences.table)
  );
  await connection.query(insertInto(createDefaultAccountCenter(tenantId), AccountCenters.table));
  await seedAdminData(connection, createAdminData(tenantId));
  await seedPreConfiguredManagementApiAccessRole(connection, tenantId);
};
