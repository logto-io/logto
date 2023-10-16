import {
  type OrganizationRoleKeys,
  OrganizationRoles,
  type CreateOrganizationRole,
  type OrganizationRole,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import SchemaQueries from '#src/utils/SchemaQueries.js';

/** Class of queries for roles in the organization template. */
export default class OrganizationRoleQueries extends SchemaQueries<
  OrganizationRoleKeys,
  CreateOrganizationRole,
  OrganizationRole
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationRoles);
  }
}
