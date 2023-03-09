import { generateStandardId } from '@logto/core-kit';

import type { CreateScope } from '../index.js';
import { AdminTenantRole } from '../types/index.js';
import type { UpdateAdminData } from './management-api.js';
import { adminTenantId } from './tenant.js';

/** The API Resource Indicator for Logto Cloud. It's only useful when domain-based multi-tenancy is enabled. */
export const cloudApiIndicator = 'https://cloud.logto.io/api';

export enum CloudScope {
  CreateTenant = 'create:tenant',
  ManageTenant = 'manage:tenant',
}

export const createCloudApi = (): Readonly<[UpdateAdminData, ...CreateScope[]]> => {
  const resourceId = generateStandardId();
  const buildScope = (name: CloudScope, description: string) => ({
    tenantId: adminTenantId,
    id: generateStandardId(),
    name,
    description,
    resourceId,
  });

  return Object.freeze([
    {
      resource: {
        tenantId: adminTenantId,
        id: resourceId,
        indicator: cloudApiIndicator,
        name: `Logto Cloud API`,
      },
      scope: buildScope(CloudScope.CreateTenant, 'Allow creating new tenants.'),
      role: {
        tenantId: adminTenantId,
        name: AdminTenantRole.User,
      },
    },
    buildScope(
      CloudScope.ManageTenant,
      'Allow managing existing tenants, including create without limitation, update, and delete.'
    ),
  ]);
};
