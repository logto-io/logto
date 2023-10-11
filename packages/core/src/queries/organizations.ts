import {
  type Organization,
  type CreateOrganization,
  type OrganizationKeys,
  Organizations,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

export default class OrganizationQueries extends SchemaQueries<
  OrganizationKeys,
  CreateOrganization,
  Organization
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, Organizations);
  }
}
