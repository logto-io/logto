import { type OrganizationScope, type OrganizationRole } from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

class OrganizationRoleApi extends ApiFactory<
  OrganizationRole,
  { name: string; description?: string; organizationScopeIds?: string[] }
> {
  constructor() {
    super('organization-roles');
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
