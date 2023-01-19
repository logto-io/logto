import type { CreateRole, CreateRolesScope } from '../db-entries/index.js';
import { UserRole } from '../types/index.js';
import { managementResourceScopeId } from './scope.js';
import { defaultTenantId } from './tenant.js';

export const adminConsoleAdminRoleId = 'ac-admin-id';

/**
 * Default Admin Role for Admin Console.
 */
export const defaultRole: Readonly<CreateRole> = {
  tenantId: defaultTenantId,
  id: adminConsoleAdminRoleId,
  name: UserRole.Admin,
  description: 'Admin role for Logto.',
};

export const defaultRoleScopeRelation: Readonly<CreateRolesScope> = {
  tenantId: defaultTenantId,
  roleId: adminConsoleAdminRoleId,
  scopeId: managementResourceScopeId,
};
