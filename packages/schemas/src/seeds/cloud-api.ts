import { generateStandardId } from '@logto/shared/universal';

import type { CreateScope, Role } from '../index.js';
import { AdminTenantRole } from '../types/index.js';

import type { UpdateAdminData } from './management-api.js';
import { adminTenantId } from './tenant.js';

/** The API Resource Indicator for Logto Cloud. It's only useful when domain-based multi-tenancy is enabled. */
export const cloudApiIndicator = 'https://cloud.logto.io/api';

export enum CloudScope {
  CreateTenant = 'create:tenant',
  ManageTenant = 'manage:tenant',
  SendSms = 'send:sms',
  SendEmail = 'send:email',
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
    buildScope(
      CloudScope.SendEmail,
      'Allow sending emails. This scope is only available to M2M application.'
    ),
    buildScope(
      CloudScope.SendSms,
      'Allow sending SMS. This scope is only available to M2M application.'
    ),
  ]);
};

export const createTenantApplicationRole = (): Readonly<Role> => ({
  tenantId: adminTenantId,
  id: generateStandardId(),
  name: AdminTenantRole.TenantApplication,
  description:
    'The role for M2M applications that represent a user tenant and send requests to Logto Cloud.',
});
