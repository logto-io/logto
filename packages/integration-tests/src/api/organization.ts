import {
  type Organization,
  type OrganizationWithRoles,
  type UserWithOrganizationRoles,
  type OrganizationWithFeatured,
  type OrganizationScope,
  type CreateOrganization,
  type Application,
  type OrganizationRole,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory, RelationApiFactory } from './factory.js';
import { OrganizationJitApi } from './organization-jit.js';

type Query = {
  q?: string;
  page?: number;
  page_size?: number;
};

export class OrganizationApi extends ApiFactory<Organization, Omit<CreateOrganization, 'id'>> {
  jit = new OrganizationJitApi(this.path);
  applications = new RelationApiFactory<Application>({
    basePath: 'organizations',
    relationPath: 'applications',
    relationKey: 'applicationIds',
  });

  constructor() {
    super('organizations');
  }

  override async getList(query?: URLSearchParams): Promise<OrganizationWithFeatured[]> {
    // eslint-disable-next-line no-restricted-syntax -- This API has different response type
    return super.getList(query) as Promise<OrganizationWithFeatured[]>;
  }

  async addApplicationsRoles(
    id: string,
    applicationIds: string[],
    organizationRoleIds: string[]
  ): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/applications/roles`, {
      json: { applicationIds, organizationRoleIds },
    });
  }

  async addUsers(id: string, userIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/users`, { json: { userIds } });
  }

  async replaceUsers(id: string, userIds: string[]): Promise<void> {
    await authedAdminApi.put(`${this.path}/${id}/users`, { json: { userIds } });
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

  async getUserRoles(id: string, userId: string, query?: Query): Promise<OrganizationRole[]> {
    return authedAdminApi
      .get(`${this.path}/${id}/users/${userId}/roles`, { searchParams: query })
      .json<OrganizationRole[]>();
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

  async addApplicationRoles(
    id: string,
    applicationId: string,
    organizationRoleIds: string[]
  ): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/applications/${applicationId}/roles`, {
      json: { organizationRoleIds },
    });
  }

  async getApplicationRoles(
    id: string,
    applicationId: string,
    page?: number,
    pageSize?: number
  ): Promise<OrganizationRole[]> {
    const search = new URLSearchParams();

    if (page) {
      search.set('page', String(page));
    }

    if (pageSize) {
      search.set('page_size', String(pageSize));
    }

    return authedAdminApi
      .get(`${this.path}/${id}/applications/${applicationId}/roles`, { searchParams: search })
      .json<OrganizationRole[]>();
  }

  async deleteApplicationRole(id: string, applicationId: string, roleId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/applications/${applicationId}/roles/${roleId}`);
  }
}
