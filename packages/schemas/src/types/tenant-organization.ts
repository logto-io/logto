/**
 * @fileoverview
 * Tenant organizations are organizations in the admin tenant that represent tenants. They are
 * created when a tenant is created, and are used to define the roles and scopes for the users in
 * the tenant.
 *
 * This module provides utilities to manage tenant organizations.
 */

import { buildSeedId } from '@logto/shared/universal';

import {
  RoleType,
  type CreateOrganization,
  type OrganizationRole,
  type OrganizationScope,
} from '../db-entries/index.js';
import { adminTenantId } from '../seeds/tenant.js';

/**
 * Given a tenant ID, return the corresponding organization ID in the admin tenant.
 *
 * In nanoid mode, this returns `t-${tenantId}` (human-readable).
 * In uuid mode, this returns a deterministic UUID v5 derived from `t-${tenantId}`.
 */
export const getTenantOrganizationId = (tenantId: string) => buildSeedId(`t-${tenantId}`);

/**
 * Given an admin tenant organization ID, return the corresponding user tenant ID.
 *
 * In nanoid mode, the organization ID has a `t-` prefix that can be stripped directly.
 * In uuid mode, the organization ID is a UUID v5 hash, so we check against known tenant IDs
 * by computing the forward mapping and comparing.
 *
 * @param organizationId - The organization ID to look up.
 * @param knownTenantIds - The list of known tenant IDs to search through. Required in uuid mode.
 */
export const getTenantIdFromOrganizationId = (
  organizationId: string,
  knownTenantIds?: string[]
): string => {
  // Fast path: nanoid mode uses the reversible `t-` prefix convention.
  if (organizationId.startsWith('t-')) {
    return organizationId.slice(2);
  }

  // UUID mode: the organization ID is a UUID v5 hash, so we need to find the tenant ID
  // by computing the forward mapping for each known tenant.
  if (knownTenantIds) {
    for (const tenantId of knownTenantIds) {
      if (getTenantOrganizationId(tenantId) === organizationId) {
        return tenantId;
      }
    }
  }

  throw new Error(
    `Cannot resolve tenant ID from organization ID: ${organizationId}. ` +
      'In UUID mode, you must provide knownTenantIds to perform the reverse lookup.'
  );
};

/**
 * Given a tenant ID, return the organization create data for the admin tenant. It follows a
 * convention to generate the organization ID and name which can be used across the system.
 *
 * @example
 * ```ts
 * const tenantId = 'test-tenant';
 * const createData = getCreateData(tenantId);
 *
 * expect(createData).toEqual({
 *   tenantId: 'admin',
 *   id: 't-test-tenant',
 *   name: 'Tenant test-tenant',
 * });
 * ```
 *
 * @see {@link getId} for the convention of generating the organization ID.
 */
export const getTenantOrganizationCreateData = (tenantId: string): Readonly<CreateOrganization> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: getTenantOrganizationId(tenantId),
    name: `Tenant ${tenantId}`,
  });

/**
 * Scope names in organization template for managing tenants.
 *
 * @remarks
 * Should sync JSDoc descriptions with {@link tenantScopeDescriptions}.
 */
export enum TenantScope {
  /** Read the tenant data. */
  ReadData = 'read:data',
  /** Write the tenant data, including creating and updating the tenant. */
  WriteData = 'write:data',
  /** Delete data of the tenant. */
  DeleteData = 'delete:data',
  /** Read members of the tenant. */
  ReadMember = 'read:member',
  /** Invite members to the tenant. */
  InviteMember = 'invite:member',
  /** Remove members from the tenant. */
  RemoveMember = 'remove:member',
  /** Update the role of a member in the tenant. */
  UpdateMemberRole = 'update:member:role',
  /** Manage the tenant settings, including name, billing, etc. */
  ManageTenant = 'manage:tenant',
}

const allTenantScopes = Object.freeze(Object.values(TenantScope));

/**
 * Given a tenant scope, return the corresponding organization scope data in the admin tenant.
 *
 * @example
 * ```ts
 * const scope = TenantScope.ReadData; // 'read:data'
 * const scopeData = getTenantScope(scope);
 *
 * expect(scopeData).toEqual({
 *   tenantId: 'admin',
 *   id: 'read-data',
 *   name: 'read:data',
 *   description: 'Read the tenant data.',
 * });
 * ```
 *
 * @see {@link tenantScopeDescriptions} for scope descriptions of each scope.
 */
export const getTenantScope = (scope: TenantScope): Readonly<OrganizationScope> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: scope.replaceAll(':', '-'),
    name: scope,
    description: tenantScopeDescriptions[scope],
  });

const tenantScopeDescriptions: Readonly<Record<TenantScope, string>> = Object.freeze({
  [TenantScope.ReadData]: 'Read the tenant data.',
  [TenantScope.WriteData]: 'Write the tenant data, including creating and updating the tenant.',
  [TenantScope.DeleteData]: 'Delete data of the tenant.',
  [TenantScope.ReadMember]: 'Read members of the tenant.',
  [TenantScope.InviteMember]: 'Invite members to the tenant.',
  [TenantScope.RemoveMember]: 'Remove members from the tenant.',
  [TenantScope.UpdateMemberRole]: 'Update the role of a member in the tenant.',
  [TenantScope.ManageTenant]: 'Manage the tenant settings, including name, billing, etc.',
});

/**
 * Role names in organization template for managing tenants.
 *
 * @remarks
 * Should sync JSDoc descriptions with {@link tenantRoleDescriptions}.
 */
export enum TenantRole {
  /** Admin of the tenant, who has all permissions. */
  Admin = 'admin',
  /** Collaborator of the tenant, who has permissions to operate the tenant data, but not the tenant settings. */
  Collaborator = 'collaborator',
}

const tenantRoleDescriptions: Readonly<Record<TenantRole, string>> = Object.freeze({
  [TenantRole.Admin]: 'Admin of the tenant, who has all permissions.',
  [TenantRole.Collaborator]:
    'Collaborator of the tenant, who has permissions to operate the tenant data, but not the tenant settings.',
});

/**
 * Given a tenant role, return the corresponding organization role data in the admin tenant.
 *
 * @example
 * ```ts
 * const role = TenantRole.Collaborator; // 'collaborator'
 * const roleData = getTenantRole(role);
 *
 * expect(roleData).toEqual({
 *   tenantId: 'admin',
 *   id: 'collaborator',
 *   name: 'collaborator',
 *   description: 'Collaborator of the tenant, who has permissions to operate the tenant data, but not the tenant settings.',
 *   type: RoleType.User,
 * });
 * ```
 *
 * @see {@link tenantRoleDescriptions} for scope descriptions of each role.
 */
export const getTenantRole = (role: TenantRole): Readonly<OrganizationRole> =>
  Object.freeze({
    tenantId: adminTenantId,
    id: buildSeedId(role),
    name: role,
    description: tenantRoleDescriptions[role],
    type: RoleType.User,
  });

/**
 * The dictionary of tenant roles and their corresponding scopes.
 * @see {TenantRole} for scope descriptions of each role.
 */
export const tenantRoleScopes: Readonly<Record<TenantRole, Readonly<TenantScope[]>>> =
  Object.freeze({
    [TenantRole.Admin]: allTenantScopes,
    [TenantRole.Collaborator]: [
      TenantScope.ReadData,
      TenantScope.WriteData,
      TenantScope.DeleteData,
      TenantScope.ReadMember,
    ],
  });
