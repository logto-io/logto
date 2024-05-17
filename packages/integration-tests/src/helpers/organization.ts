import {
  type OrganizationScope,
  type OrganizationRole,
  type Organization,
  type OrganizationRoleWithScopes,
  type OrganizationInvitationEntity,
  type JsonObject,
} from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import {
  OrganizationInvitationApi,
  type PostOrganizationInvitationData,
} from '#src/api/organization-invitation.js';
import {
  type CreateOrganizationRolePostData,
  OrganizationRoleApi,
} from '#src/api/organization-role.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { OrganizationApi } from '#src/api/organization.js';

/* eslint-disable @silverhand/fp/no-mutating-methods */
export class OrganizationInvitationApiTest extends OrganizationInvitationApi {
  #invitations: OrganizationInvitationEntity[] = [];

  get invitations(): OrganizationInvitationEntity[] {
    return this.#invitations;
  }

  override async create(
    data: PostOrganizationInvitationData
  ): Promise<OrganizationInvitationEntity> {
    const created = await super.create(data);
    this.invitations.push(created);
    return created;
  }

  /**
   * Delete all created invitations. This method will ignore errors when deleting invitations to
   * avoid error when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    // Use `trySafe` to avoid error when invitation is deleted by other tests.
    await Promise.all(
      this.invitations.map(async (invitation) => trySafe(this.delete(invitation.id)))
    );
    this.#invitations = [];
  }
}

/**
 * A help class that records the created organization roles, and provides a `cleanUp` method to
 * delete them.
 */
export class OrganizationRoleApiTest extends OrganizationRoleApi {
  #roles: OrganizationRole[] = [];

  get roles(): OrganizationRole[] {
    return this.#roles;
  }

  override async create(data: CreateOrganizationRolePostData): Promise<OrganizationRoleWithScopes> {
    const created = await super.create(data);
    this.roles.push(created);
    // eslint-disable-next-line no-restricted-syntax -- to override the type
    return created as OrganizationRoleWithScopes;
  }

  /**
   * Delete all created roles. This method will ignore errors when deleting roles to avoid error
   * when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    // Use `trySafe` to avoid error when role is deleted by other tests.
    await Promise.all(this.roles.map(async (role) => trySafe(this.delete(role.id))));
    this.#roles = [];
  }
}

/**
 * A help class that records the created organization scopes, and provides a `cleanUp` method to
 * delete them.
 */
export class OrganizationScopeApiTest extends OrganizationScopeApi {
  #scopes: OrganizationScope[] = [];

  get scopes(): OrganizationScope[] {
    return this.#scopes;
  }

  override async create(data: { name: string; description?: string }): Promise<OrganizationScope> {
    const created = await super.create(data);
    this.scopes.push(created);
    return created;
  }

  /**
   * Delete all created scopes. This method will ignore errors when deleting scopes to avoid error
   * when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    // Use `trySafe` to avoid error when scope is deleted by other tests.
    await Promise.all(this.scopes.map(async (scope) => trySafe(this.delete(scope.id))));
    this.#scopes = [];
  }
}

/**
 * A help class that records the created organizations, and provides a `cleanUp` method to
 * delete them. It also provides `roleApi` and `scopeApi` to manage the organization roles and
 * scopes.
 *
 * @see OrganizationRoleApiTest for more information about `roleApi`.
 * @see OrganizationScopeApiTest for more information about `scopeApi`.
 */
export class OrganizationApiTest extends OrganizationApi {
  roleApi = new OrganizationRoleApiTest();
  scopeApi = new OrganizationScopeApiTest();

  #organizations: Organization[] = [];

  get organizations(): Organization[] {
    return this.#organizations;
  }

  override async create(data: {
    name: string;
    description?: string;
    customData?: JsonObject;
  }): Promise<Organization> {
    const created = await super.create(data);
    this.organizations.push(created);
    return created;
  }

  /**
   * Delete all created organizations, roles and scopes. No need to call `cleanUp` of `roleApi` and
   * `scopeApi` manually.
   *
   * This method will ignore errors when deleting organizations, roles and scopes to avoid error
   * when they are deleted by other tests.
   */
  async cleanUp(): Promise<void> {
    await Promise.all(
      // Use `trySafe` to avoid error when organization is deleted by other tests.
      this.organizations.map(async (organization) => trySafe(this.delete(organization.id)))
    );
    this.#organizations = [];
  }
}
/* eslint-enable @silverhand/fp/no-mutating-methods */
