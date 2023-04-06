import {
  generateOidcCookieKey,
  generateOidcPrivateKey,
} from '@logto/cli/lib/commands/database/utils.js';
import { DemoConnector } from '@logto/connector-kit';
import { createTenantMetadata } from '@logto/core-kit';
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
import { generateStandardId } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import type { ZodType } from 'zod';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { createApplicationsQueries } from '#src/queries/application.js';
import { createConnectorsQuery } from '#src/queries/connector.js';
import type { Queries } from '#src/queries/index.js';
import { createRolesQuery } from '#src/queries/roles.js';
import { createSystemsQuery } from '#src/queries/system.js';
import { createTenantsQueries } from '#src/queries/tenants.js';
import { createUsersQueries } from '#src/queries/users.js';
import { getDatabaseName } from '#src/queries/utils.js';
import { createCloudServiceConnector } from '#src/utils/connector/seed.js';
import { insertInto } from '#src/utils/query.js';
import { getTenantIdFromManagementApiIndicator } from '#src/utils/tenant.js';

const demoSocialConnectorId = 'logto-social-demo';

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
    const connectors = createConnectorsQuery(transaction);
    const systems = createSystemsQuery(transaction);

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
        insertInto(createDefaultSignInExperience(tenantId, true), SignInExperiences.table)
      ),
    ]);

    // Create demo connectors
    const { cloudUrlSet } = EnvSet.global;

    await Promise.all(
      [DemoConnector.Email, DemoConnector.Sms].map(async (connectorId) => {
        return connectors.insertConnector(
          createCloudServiceConnector({
            tenantId,
            connectorId,
            appId: m2mApplication.id,
            appSecret: m2mApplication.secret,
          })
        );
      })
    );

    // Create demo social connectors
    const presetSocialConnectors = await systems.getDemoSocialValue();

    if (presetSocialConnectors) {
      await Promise.all(
        presetSocialConnectors.map(async (connector) => {
          return connectors.insertConnector({
            id: generateStandardId(),
            tenantId,
            connectorId: demoSocialConnectorId,
            metadata: {
              name: { en: connector.name },
              target: connector.provider,
              logo: connector.logo,
              logoDark: connector.logoDark,
            },
            config: {
              provider: connector.provider,
              clientId: connector.clientId,
              redirectUri: `${cloudUrlSet.endpoint.toString()}social-demo-callback`,
            },
          });
        })
      );
    }

    // Update Redirect URI for Admin Console
    await tenants.appendAdminConsoleRedirectUris(
      ...cloudUrlSet.deduplicated().map((url) => appendPath(url, tenantModel.id, 'callback'))
    );

    await transaction.end();
    /* === End === */

    return { id: tenantId, indicator: adminDataInAdminTenant.resource.indicator };
  }
}
