import { type OrganizationRole } from '@logto/schemas';

import { ApiFactory } from './factory.js';

class OrganizationRoleApi extends ApiFactory<
  OrganizationRole,
  { name: string; description?: string; scopeIds?: string[] }
> {
  constructor() {
    super('organization-roles');
  }
}

export const roleApi = new OrganizationRoleApi();
