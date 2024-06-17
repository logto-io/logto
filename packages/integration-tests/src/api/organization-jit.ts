import { type OrganizationRole, type OrganizationJitEmailDomain } from '@logto/schemas';

import { authedAdminApi } from './api.js';

export class OrganizationJitApi {
  constructor(public path: string) {}

  async getEmailDomains(
    id: string,
    page?: number,
    pageSize?: number
  ): Promise<OrganizationJitEmailDomain[]> {
    const searchParams = new URLSearchParams();

    if (page) {
      searchParams.append('page', String(page));
    }

    if (pageSize) {
      searchParams.append('page_size', String(pageSize));
    }

    return authedAdminApi
      .get(`${this.path}/${id}/jit/email-domains`, { searchParams })
      .json<OrganizationJitEmailDomain[]>();
  }

  async addEmailDomain(id: string, emailDomain: string): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/jit/email-domains`, { json: { emailDomain } });
  }

  async deleteEmailDomain(id: string, emailDomain: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/jit/email-domains/${emailDomain}`);
  }

  async replaceEmailDomains(id: string, emailDomains: string[]): Promise<void> {
    await authedAdminApi.put(`${this.path}/${id}/jit/email-domains`, { json: { emailDomains } });
  }

  async getRoles(id: string): Promise<OrganizationRole[]> {
    return authedAdminApi.get(`${this.path}/${id}/jit/roles`).json<OrganizationRole[]>();
  }

  async addRole(id: string, organizationRoleIds: string[]): Promise<void> {
    await authedAdminApi.post(`${this.path}/${id}/jit/roles`, { json: { organizationRoleIds } });
  }

  async deleteRole(id: string, organizationRoleId: string): Promise<void> {
    await authedAdminApi.delete(`${this.path}/${id}/jit/roles/${organizationRoleId}`);
  }

  async replaceRoles(id: string, organizationRoleIds: string[]): Promise<void> {
    await authedAdminApi.put(`${this.path}/${id}/jit/roles`, { json: { organizationRoleIds } });
  }
}
