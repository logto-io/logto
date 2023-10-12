import {
  type OrganizationScopeKeys,
  OrganizationScopes,
  type CreateOrganizationScope,
  type OrganizationScope,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

/** Class of queries for scopes in the organization template. */
export default class OrganizationScopeQueries extends SchemaQueries<
  OrganizationScopeKeys,
  CreateOrganizationScope,
  OrganizationScope
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationScopes);
  }
}
