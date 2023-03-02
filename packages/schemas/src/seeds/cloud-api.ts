import { generateStandardId } from '@logto/core-kit';

import { UserRole } from '../types/index.js';
import type { UpdateAdminData } from './management-api.js';
import { adminTenantId } from './tenant.js';

/** The API Resource Indicator for Logto Cloud. It's only useful when domain-based multi-tenancy is enabled. */
export const cloudApiIndicator = 'https://cloud.logto.io/api';

export enum CloudScope {
  CreateTenant = 'create:tenant',
}

export const createCloudApi = (): Readonly<UpdateAdminData> => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId: adminTenantId,
      id: resourceId,
      indicator: cloudApiIndicator,
      name: `Logto Cloud API`,
    },
    scope: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: CloudScope.CreateTenant,
      description: 'Allow creating new tenants.',
      resourceId,
    },
    role: {
      tenantId: adminTenantId,
      name: UserRole.User,
    },
  });
};
