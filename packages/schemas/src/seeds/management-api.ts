import { generateStandardId } from '@logto/core-kit';

import type { CreateResource, CreateRole, CreateScope } from '../db-entries/index.js';
import { UserRole } from '../types/index.js';
import { adminTenantId, defaultTenantId } from './tenant.js';

export type AdminData = {
  resource: CreateResource;
  scope: CreateScope;
  role: CreateRole;
};

export const managementApiScopeAll = 'all';

// Consider remove the dependency of IDs
const defaultResourceId = 'management-api';
const defaultScopeAllId = 'management-api-all';

// Consider combine this with `createManagementApiInAdminTenant()`
/** The fixed Management API Resource for `default` tenant. */
export const defaultManagementApi = Object.freeze({
  resource: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: defaultResourceId,
    /**
     * The fixed resource indicator for Management APIs.
     *
     * Admin Console requires the access token of this resource to be functional.
     */
    indicator: 'https://logto.app/api',
    name: 'Logto Management API',
  },
  scope: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: defaultScopeAllId,
    name: managementApiScopeAll,
    description: 'Default scope for Management API, allows all permissions.',
    /** @deprecated You should not rely on this constant. Change to something else. */
    resourceId: defaultResourceId,
  },
  role: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: 'admin-role',
    name: UserRole.Admin,
    description: 'Admin role for Logto.',
  },
}) satisfies AdminData;

export const getManagementApiResourceIndicator = (tenantId: string) =>
  `https://${tenantId}.logto.app/api`;

export const getManagementApiAdminName = (tenantId: string) => `${tenantId}:${UserRole.Admin}`;

/** Create a Management API Resource of the given tenant ID for `admin` tenant. */
export const createManagementApiInAdminTenant = (tenantId: string): AdminData => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId: adminTenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(tenantId),
      name: `Logto Management API for tenant ${tenantId}`,
    },
    scope: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: managementApiScopeAll,
      description: 'Default scope for Management API, allows all permissions.',
      resourceId,
    },
    role: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: getManagementApiAdminName(tenantId),
      description: 'Admin role for Logto.',
    },
  });
};
