import { generateStandardId } from '@logto/core-kit';

import { adminTenantId, defaultTenantId } from './tenant.js';
import type { CreateResource, CreateRole, CreateScope } from '../db-entries/index.js';
import { PredefinedScope, InternalRole, AdminTenantRole } from '../types/index.js';

export type AdminData = {
  resource: CreateResource;
  scope: CreateScope;
  role: CreateRole;
};

export type UpdateAdminData = Omit<AdminData, 'role'> & {
  /** Attach to an existing role instead of creating one. */
  role: Pick<CreateRole, 'tenantId' | 'name'>;
};

// Consider remove the dependency of IDs
const defaultResourceId = 'management-api';
const defaultScopeAllId = 'management-api-all';

// Consider combining this with `createAdminData()`
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
    indicator: `https://${defaultTenantId}.logto.app/api`,
    name: 'Logto Management API',
  },
  scope: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: defaultScopeAllId,
    name: PredefinedScope.All,
    description: 'Default scope for Management API, allows all permissions.',
    /** @deprecated You should not rely on this constant. Change to something else. */
    resourceId: defaultResourceId,
  },
  role: {
    tenantId: defaultTenantId,
    /** @deprecated You should not rely on this constant. Change to something else. */
    id: 'admin-role',
    name: InternalRole.Admin,
    description: `Internal admin role for Logto tenant ${defaultTenantId}.`,
  },
}) satisfies AdminData;

export function getManagementApiResourceIndicator<TenantId extends string>(
  tenantId: TenantId
): `https://${TenantId}.logto.app/api`;
export function getManagementApiResourceIndicator<TenantId extends string, Path extends string>(
  tenantId: TenantId,
  path: Path
): `https://${TenantId}.logto.app/${Path}`;

export function getManagementApiResourceIndicator(tenantId: string, path = 'api') {
  return `https://${tenantId}.logto.app/${path}`;
}

export const getManagementApiAdminName = <TenantId extends string>(tenantId: TenantId) =>
  `${tenantId}:${AdminTenantRole.Admin}` as const;

/** Create a set of admin data for Management API of the given tenant ID. */
export const createAdminData = (tenantId: string): AdminData => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(tenantId),
      name: `Logto Management API`,
    },
    scope: {
      tenantId,
      id: generateStandardId(),
      name: PredefinedScope.All,
      description: 'Default scope for Management API, allows all permissions.',
      resourceId,
    },
    role: {
      tenantId,
      id: generateStandardId(),
      name: InternalRole.Admin,
      description: `Internal admin role for Logto tenant ${defaultTenantId}.`,
    },
  });
};

/** Create a set of admin data for Management API of the given tenant ID for `admin` tenant. */
export const createAdminDataInAdminTenant = (tenantId: string): AdminData => {
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
      name: PredefinedScope.All,
      description: 'Default scope for Management API, allows all permissions.',
      resourceId,
    },
    role: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: getManagementApiAdminName(tenantId),
      description: `Admin tenant admin role for Logto tenant ${tenantId}.`,
    },
  });
};

export const createMeApiInAdminTenant = (): AdminData => {
  const resourceId = generateStandardId();

  return Object.freeze({
    resource: {
      tenantId: adminTenantId,
      id: resourceId,
      indicator: getManagementApiResourceIndicator(adminTenantId, 'me'),
      name: `Logto Me API`,
    },
    scope: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: PredefinedScope.All,
      description: 'Default scope for Me API, allows all permissions.',
      resourceId,
    },
    role: {
      tenantId: adminTenantId,
      id: generateStandardId(),
      name: AdminTenantRole.User,
      description: 'Default role for admin tenant.',
    },
  });
};
