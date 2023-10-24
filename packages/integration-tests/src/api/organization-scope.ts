import { type OrganizationScope } from '@logto/schemas';

import { ApiFactory } from './factory.js';

export class OrganizationScopeApi extends ApiFactory<
  OrganizationScope,
  { name: string; description?: string }
> {
  constructor() {
    super('organization-scopes');
  }
}
