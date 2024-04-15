import {
  type Role,
  type Organization,
  type OrganizationWithRoles,
  type UserWithOrganizationRoles,
  type OrganizationWithFeatured,
  type OrganizationScope,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

type Query = {
  q?: string;
  page?: number;
  page_size?: number;
};

export class OrganizationApi extends ApiFactory<
  Organization,
  { name: string; description?: string }
> {
  constructor() {
    super('organizations');
  }

  override async getList(query?: URLSearchParams): Promise<OrganizationWithFeatured[]> {
    // eslint-disable-next-line no-restricted-syntax -- This API has different response type
    return super.getList(query) as Promise<OrganizationWithFeatured[]>;
  }

  async addUsers(id: string, userIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users`, { json: { userIds } });
  }

  async getUsers(
    id: string,
    query?: Query
  ): Promise<[rows: UserWithOrganizationRoles[], totalCount: number]> {
    const got = await authedAdminApi.get(`${this.path}/${id}/users`, { searchParams: query });
    return [await got.json(), Number(got.headers.get('total-number') ?? 0)];
  }

  async deleteUser(id: string, userId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/users/${userId}`);
  }

  async addUserRoles(id: string, userId: string, organizationRoleIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users/${userId}/roles`, {
      json: { organizationRoleIds },
    });
  }

  async addUsersRoles(id: string, userIds: string[], organizationRoleIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users/roles`, {
      json: { userIds, organizationRoleIds },
    });
  }

  async getUserRoles(id: string, userId: string): Promise<Role[]> {
    return authedAdminApi.get(`${this.path}/${id}/users/${userId}/roles`).json<Role[]>();
  }

  async deleteUserRole(id: string, userId: string, roleId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/users/${userId}/roles/${roleId}`);
  }

  async getUserOrganizations(userId: string): Promise<OrganizationWithRoles[]> {
    return authedAdminApi.get(`users/${userId}/organizations`).json<OrganizationWithRoles[]>();
  }

  async getUserOrganizationScopes(id: string, userId: string): Promise<OrganizationScope[]> {
    return authedAdminApi
      .get(`${this.path}/${id}/users/${userId}/scopes`)
      .json<OrganizationScope[]>();
  }
}
