import { type OrganizationScope } from '@logto/schemas';

import { ApiFactory } from './factory.js';

class OrganizationScopeApi extends ApiFactory<
  OrganizationScope,
  { name: string; description?: string }
> {
  constructor() {
    super('organization-scopes');
  }
}

/** API methods for operating organization template scopes. */
export const scopeApi = new OrganizationScopeApi();
