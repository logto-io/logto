export enum TenantTag {
  /* Development tenants are free to use but are not meant to be used as production environment. */
  Development = 'development',
  /* @deprecated */
  Staging = 'staging',
  /* A production tenant must have an associated subscription plan, even if it's a free plan. */
  Production = 'production',
}

/** Tenant roles that are used in organization template of admin tenant. */
export enum TenantRole {
  /* A tenant admin can manage all resources in the tenant. */
  Admin = 'admin',
  /* A tenant member can manage resources without deleting them. */
  Member = 'member',
}

/** Tenant scopes that are used in organization template of admin tenant. */
export enum TenantScope {
  /** Read tenant data. */
  ReadTenant = 'read:tenant',
  /** Create or update tenant data. */
  WriteTenant = 'write:tenant',
  /** Delete tenant data. */
  DeleteTenant = 'delete:tenant',
  /** Invite a new member to the tenant. */
  InviteMember = 'invite:member',
  /** Remove a member from the tenant. */
  RemoveMember = 'remove:member',
  /** Update a member's role in the tenant. */
  UpdateMemberRole = 'update:member:role',
}

/** The prefix that applies to all organization IDs that are created to represent a tenant. */
export const tenantOrganizationIdPrefix = 't-';
