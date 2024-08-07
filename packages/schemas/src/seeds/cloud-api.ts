import { generateStandardId } from '@logto/shared/universal';

import { RoleType } from '../db-entries/index.js';
import type { CreateScope, Role } from '../db-entries/index.js';
import { AdminTenantRole } from '../types/index.js';

import type { UpdateAdminData } from './management-api.js';
import { adminTenantId } from './tenant.js';

/** The API Resource Indicator for Logto Cloud. It's only useful when domain-based multi-tenancy is enabled. */
export const cloudApiIndicator = 'https://cloud.logto.io/api';

export enum CloudScope {
  /** The user can create a user tenant. */
  CreateTenant = 'create:tenant',
  /** The user can update or delete its own tenants. */
  ManageTenantSelf = 'manage:tenant:self',
  SendSms = 'send:sms',
  SendEmail = 'send:email',
  /**
   * The user can access external (independent from Logto instance) resource to run JWT payload customizer
   * scripts and fetch the parsed token payload.
   */
  FetchCustomJwt = 'fetch:custom:jwt',
  /** The user can see and manage affiliates, including create, update, and delete. */
  ManageAffiliate = 'manage:affiliate',
  /** The user can create new affiliates and logs. */
  CreateAffiliate = 'create:affiliate',
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
      scopes: [
        buildScope(CloudScope.CreateTenant, 'Allow creating new tenants.'),
        buildScope(
          CloudScope.ManageTenantSelf,
          'Allow managing tenant itself, including update and delete.'
        ),
      ],
      role: {
        tenantId: adminTenantId,
        name: AdminTenantRole.User,
      },
    },
    buildScope(
      CloudScope.SendEmail,
      'Allow sending emails. This scope is only available to M2M application.'
    ),
    buildScope(
      CloudScope.SendSms,
      'Allow sending SMS. This scope is only available to M2M application.'
    ),
    buildScope(
      CloudScope.FetchCustomJwt,
      'Allow accessing external resource to execute JWT payload customizer script and fetch the parsed token payload.'
    ),
    buildScope(CloudScope.CreateAffiliate, 'Allow creating new affiliates and logs.'),
    buildScope(
      CloudScope.ManageAffiliate,
      'Allow managing affiliates, including create, update, and delete.'
    ),
  ]);
};

export const createTenantApplicationRole = (): Readonly<Role> => ({
  tenantId: adminTenantId,
  id: generateStandardId(),
  name: AdminTenantRole.TenantApplication,
  description:
    'The role for M2M applications that represent a user tenant and send requests to Logto Cloud.',
  type: RoleType.MachineToMachine,
  isDefault: false,
});
