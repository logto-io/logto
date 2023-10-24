import {
  type OrganizationScope,
  type OrganizationRole,
  type OrganizationRoleWithScopes,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

class OrganizationRoleApi extends ApiFactory<
  OrganizationRole,
  { name: string; description?: string; organizationScopeIds?: string[] }
> {
  constructor() {
    super('organization-roles');
  }

  override async getList(
    params?: URLSearchParams | undefined
  ): Promise<OrganizationRoleWithScopes[]> {
    // eslint-disable-next-line no-restricted-syntax
    return super.getList(params) as Promise<OrganizationRoleWithScopes[]>;
  }

  override async get(id: string): Promise<OrganizationRoleWithScopes> {
    // eslint-disable-next-line no-restricted-syntax
    return super.get(id) as Promise<OrganizationRoleWithScopes>;
  }

  async addScopes(id: string, organizationScopeIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/scopes`, { json: { organizationScopeIds } });
  }

  async getScopes(id: string, searchParams?: URLSearchParams): Promise<OrganizationScope[]> {
    return authedAdminApi
      .get(`${this.path}/${id}/scopes`, { searchParams })
      .json<OrganizationScope[]>();
  }

  async deleteScope(id: string, scopeId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/scopes/${scopeId}`);
  }
}

export const roleApi = new OrganizationRoleApi();
