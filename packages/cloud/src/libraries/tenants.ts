import {
  generateOidcCookieKey,
  generateOidcPrivateKey,
} from '@logto/cli/lib/commands/database/utils.js';
import { generateStandardId } from '@logto/core-kit';
import type { LogtoOidcConfigType, TenantInfo, TenantModel } from '@logto/schemas';
import {
  createAdminTenantApplicationRole,
  AdminTenantRole,
  createTenantMachineToMachineApplication,
  LogtoOidcConfigKey,
  LogtoConfigs,
  SignInExperiences,
  createDefaultAdminConsoleConfig,
  createDefaultSignInExperience,
  adminTenantId,
  createAdminData,
  createAdminDataInAdminTenant,
} from '@logto/schemas';
import { createTenantMetadata } from '@logto/shared';
import type { ZodType } from 'zod';
import { z } from 'zod';

import { createApplicationsQueries } from '#src/queries/application.js';
import type { Queries } from '#src/queries/index.js';
import { createRolesQuery } from '#src/queries/roles.js';
import { createTenantsQueries } from '#src/queries/tenants.js';
import { createUsersQueries } from '#src/queries/users.js';
import { getDatabaseName } from '#src/queries/utils.js';
import { insertInto } from '#src/utils/query.js';
import { getTenantIdFromManagementApiIndicator } from '#src/utils/tenant.js';

export const tenantInfoGuard: ZodType<TenantInfo> = z.object({
  id: z.string(),
  indicator: z.string(),
});

const oidcConfigBuilders: {
  [key in LogtoOidcConfigKey]: () => Promise<LogtoOidcConfigType[key]>;
} = {
  [LogtoOidcConfigKey.CookieKeys]: async () => [generateOidcCookieKey()],
  [LogtoOidcConfigKey.PrivateKeys]: async () => [await generateOidcPrivateKey()],
};

export class TenantsLibrary {
  constructor(public readonly queries: Queries) {}

  async getAvailableTenants(userId: string): Promise<TenantInfo[]> {
    const { getManagementApiLikeIndicatorsForUser } = this.queries.tenants;
    const { rows } = await getManagementApiLikeIndicatorsForUser(userId);

    return rows
      .map(({ indicator }) => ({
        id: getTenantIdFromManagementApiIndicator(indicator),
        indicator,
      }))
      .filter((tenant): tenant is TenantInfo => Boolean(tenant.id));
  }

  async createNewTenant(forUserId: string): Promise<TenantInfo> {
    const databaseName = await getDatabaseName(this.queries.client);
    const { id: tenantId, parentRole, role, password } = createTenantMetadata(databaseName);

    // Init tenant
    const tenantModel: TenantModel = { id: tenantId, dbUser: role, dbUserPassword: password };
    const transaction = await this.queries.client.transaction();
    const tenants = createTenantsQueries(transaction);
    const users = createUsersQueries(transaction);
    const applications = createApplicationsQueries(transaction);
    const roles = createRolesQuery(transaction);

    /* === Start === */
    await transaction.start();

    // Init tenant
    await tenants.insertTenant(tenantModel);
    await tenants.createTenantRole(parentRole, role, password);

    // Create admin data set (resource, roles, etc.)
    const adminDataInAdminTenant = createAdminDataInAdminTenant(tenantId);
    await tenants.insertAdminData(adminDataInAdminTenant);
    await tenants.insertAdminData(createAdminData(tenantId));
    await users.assignRoleToUser({
      id: generateStandardId(),
      tenantId: adminTenantId,
      userId: forUserId,
      roleId: adminDataInAdminTenant.role.id,
    });
    // Create M2M App
    const m2mRoleId = await roles.findRoleIdByName(
      AdminTenantRole.TenantApplication,
      adminTenantId
    );
    const m2mApplication = createTenantMachineToMachineApplication(tenantId);
    await applications.insertApplication(m2mApplication);
    await applications.assignRoleToApplication(
      createAdminTenantApplicationRole(m2mApplication.id, m2mRoleId)
    );

    // Create initial configs
    await Promise.all([
      ...Object.entries(oidcConfigBuilders).map(async ([key, build]) =>
        transaction.query(insertInto({ tenantId, key, value: await build() }, LogtoConfigs.table))
      ),
      transaction.query(insertInto(createDefaultAdminConsoleConfig(tenantId), LogtoConfigs.table)),
      transaction.query(
        insertInto(createDefaultSignInExperience(tenantId), SignInExperiences.table)
      ),
    ]);

    // Update Redirect URI for Admin Console
    await tenants.appendAdminConsoleRedirectUris(
      ...['http://localhost:3003', 'https://cloud.logto.dev'].map(
        (endpoint) => new URL(`/${tenantModel.id}/callback`, endpoint)
      )
    );

    await transaction.end();
    /* === End === */

    return { id: tenantId, indicator: adminDataInAdminTenant.resource.indicator };
  }
}
