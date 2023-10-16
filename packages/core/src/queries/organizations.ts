import {
  type Organization,
  type CreateOrganization,
  type OrganizationKeys,
  Organizations,
  OrganizationRoles,
  OrganizationScopes,
  OrganizationRoleScopeRelations,
} from '@logto/schemas';
import { type CommonQueryMethods } from 'slonik';

import RelationQueries from '#src/utils/RelationQueries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';

export default class OrganizationQueries extends SchemaQueries<
  OrganizationKeys,
  CreateOrganization,
  Organization
> {
  /** Queries for roles in the organization template. */
  roles = new SchemaQueries(this.pool, OrganizationRoles);
  /** Queries for scopes in the organization template. */
  scopes = new SchemaQueries(this.pool, OrganizationScopes);

  /** Queries for relations that connected with organization-related entities. */
  relations = {
    /** Queries for organization role - organization scope relations. */
    rolesScopes: new RelationQueries(
      this.pool,
      OrganizationRoleScopeRelations.table,
      OrganizationRoles.table,
      OrganizationScopes.table
    ),
  };

  constructor(pool: CommonQueryMethods) {
    super(pool, Organizations);
  }
}
