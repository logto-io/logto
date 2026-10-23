import { TenantRole } from '@logto/schemas';

const tenantRolePhrases = Object.freeze({
  [TenantRole.Admin]: 'admin',
  [TenantRole.Collaborator]: 'collaborator',
  [TenantRole.Viewer]: 'viewer',
} as const) satisfies Record<TenantRole, string>;

export const findTenantRole = (roleId?: string) =>
  Object.values(TenantRole).find((role) => role === roleId);

/** The `admin_console.tenant_members` phrase that labels a member's role. */
export const getTenantRolePhrase = (roleId: string) =>
  tenantRolePhrases[findTenantRole(roleId) ?? TenantRole.Collaborator];

/** Viewer is Cloud-only: only the Cloud Management API proxy enforces its read-only scopes. */
export const getAssignableTenantRoles = ({ isCloud }: { isCloud: boolean }) =>
  Object.values(TenantRole).filter((role) => role !== TenantRole.Viewer || isCloud);
