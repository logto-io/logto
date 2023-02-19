import { generateStandardId } from '@logto/core-kit';
import type { TenantModel } from '@logto/schemas';
import {
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

import type { Queries } from '#src/queries/index.js';
import { getDatabaseName } from '#src/queries/utils.js';
import { insertInto } from '#src/utils/query.js';
import { getTenantIdFromManagementApiIndicator } from '#src/utils/tenant.js';

export type TenantInfo = {
  id: string;
  indicator: string;
};

export const tenantInfoGuard: ZodType<TenantInfo> = z.object({
  id: z.string(),
  indicator: z.string(),
});

export const createTenantsLibrary = (queries: Queries) => {
  const { getManagementApiLikeIndicatorsForUser, insertTenant, createTenantRole, insertAdminData } =
    queries.tenants;
  const { assignRoleToUser } = queries.users;

  const getAvailableTenants = async (userId: string): Promise<TenantInfo[]> => {
    const { rows } = await getManagementApiLikeIndicatorsForUser(userId);

    return rows
      .map(({ indicator }) => ({
        id: getTenantIdFromManagementApiIndicator(indicator),
        indicator,
      }))
      .filter((tenant): tenant is TenantInfo => Boolean(tenant.id));
  };

  const createNewTenant = async (forUserId: string): Promise<TenantInfo> => {
    const { client } = queries;
    const databaseName = await getDatabaseName(client);
    const { id: tenantId, parentRole, role, password } = createTenantMetadata(databaseName);

    // TODO: @gao wrap into transaction
    // Init tenant
    const tenantModel: TenantModel = { id: tenantId, dbUser: role, dbUserPassword: password };
    await insertTenant(tenantModel);
    await createTenantRole(parentRole, role, password);

    // Create admin data set (resource, roles, etc.)
    const adminDataInAdminTenant = createAdminDataInAdminTenant(tenantId);
    await insertAdminData(adminDataInAdminTenant);
    await insertAdminData(createAdminData(tenantId));
    await assignRoleToUser({
      id: generateStandardId(),
      tenantId: adminTenantId,
      userId: forUserId,
      roleId: adminDataInAdminTenant.role.id,
    });

    // Create initial configs
    await Promise.all([
      client.query(insertInto(createDefaultAdminConsoleConfig(tenantId), LogtoConfigs.table)),
      client.query(insertInto(createDefaultSignInExperience(tenantId), SignInExperiences.table)),
    ]);

    return { id: tenantId, indicator: adminDataInAdminTenant.resource.indicator };
  };

  return { getAvailableTenants, createNewTenant };
};
