import { type Role, type Organization, type OrganizationWithRoles } from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

class OrganizationApi extends ApiFactory<Organization, { name: string; description?: string }> {
  constructor() {
    super('organizations');
  }

  async addUsers(id: string, userIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users`, { json: { userIds } });
  }

  async getUsers(id: string): Promise<Organization[]> {
    return authedAdminApi.get(`${this.path}/${id}/users`).json<Organization[]>();
  }

  async deleteUser(id: string, userId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/users/${userId}`);
  }

  async addUserRoles(id: string, userId: string, organizationRoleIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users/${userId}/roles`, {
      json: { organizationRoleIds },
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
}

/** API methods for operating organizations. */
export const organizationApi = new OrganizationApi();
