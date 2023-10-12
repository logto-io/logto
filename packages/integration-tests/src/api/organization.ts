import { type Organization } from '@logto/schemas';

import { ApiFactory } from './factory.js';

class OrganizationApi extends ApiFactory<Organization, { name: string; description?: string }> {
  constructor() {
    super('organizations');
  }
}

/** API methods for operating organizations. */
export const organizationApi = new OrganizationApi();
