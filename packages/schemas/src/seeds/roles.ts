import type { CreateRole, CreateRolesScope } from '../db-entries/index.js';
import { UserRole } from '../types/index.js';
import { managementApiScopeAll } from './scope.js';
import { defaultTenantId } from './tenant.js';

export const adminRoleId = 'admin-role';
export const adminRoleScopeId = 'admin-role-scope';

/**
 * Default Admin Role for Admin Console.
 */
export const defaultRole: Readonly<CreateRole> = {
  tenantId: defaultTenantId,
  id: adminRoleId,
  name: UserRole.Admin,
  description: 'Admin role for Logto.',
};

export const defaultRoleScopeRelation: Readonly<CreateRolesScope> = {
  id: adminRoleScopeId,
  tenantId: defaultTenantId,
  roleId: adminRoleId,
  scopeId: managementApiScopeAll,
};
