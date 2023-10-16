import { type OrganizationScope, type OrganizationRole } from '@logto/schemas';

import { authedAdminApi } from './api.js';
import { ApiFactory } from './factory.js';

class OrganizationRoleApi extends ApiFactory<
  OrganizationRole,
  { name: string; description?: string; scopeIds?: string[] }
> {
  constructor() {
    super('organization-roles');
  }

  async addScopes(id: string, scopeIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/scopes`, { json: { scopeIds } });
  }

  async getScopes(id: string): Promise<OrganizationScope[]> {
    return authedAdminApi.get(`${this.path}/${id}/scopes`).json<OrganizationScope[]>();
  }

  async deleteScope(id: string, scopeId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/scopes/${scopeId}`);
  }
}

export const roleApi = new OrganizationRoleApi();
