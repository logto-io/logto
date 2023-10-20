import {
  type Organization,
  type CreateOrganization,
  type OrganizationKeys,
  Organizations,
  OrganizationRoles,
  OrganizationScopes,
  OrganizationRoleScopeRelations,
  Users,
  OrganizationUserRelations,
  OrganizationRoleUserRelations,
} from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';
import { z } from 'zod';

import RelationQueries from '#src/utils/RelationQueries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';

/**
 * The simplified organization role entity that is returned in the `roles` field
 * of the organization.
 *
 * @remarks
 * The type MUST be kept in sync with the query in {@link UserRelationQueries.getOrganizationsByUserId}.
 */
type RoleEntity = {
  id: string;
  name: string;
};

/**
 * The organization entity with the `roles` field that contains the roles of the
 * current member of the organization.
 */
type OrganizationWithRoles = Organization & {
  /** The roles of the current member of the organization. */
  roles: RoleEntity[];
};

export const organizationWithRolesGuard: z.ZodType<OrganizationWithRoles> =
  Organizations.guard.extend({
    roles: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
  });

class UserRelationQueries extends RelationQueries<[typeof Organizations, typeof Users]> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationUserRelations.table, Organizations, Users);
  }

  async getOrganizationsByUserId(userId: string): Promise<Readonly<OrganizationWithRoles[]>> {
    const organizationRoles = convertToIdentifiers(OrganizationRoles, true);
    const organizations = convertToIdentifiers(Organizations, true);
    const { fields } = convertToIdentifiers(OrganizationUserRelations, true);
    const oruRelations = convertToIdentifiers(OrganizationRoleUserRelations, true);

    return this.pool.any<OrganizationWithRoles>(sql`
      select
        ${organizations.table}.*,
        json_agg(
          json_build_object(
            'id', ${organizationRoles.fields.id},
            'name', ${organizationRoles.fields.name})
          )
        as roles
      from ${this.table}
      join ${organizations.table}
        on ${fields.organizationId} = ${organizations.fields.id}
      left join ${oruRelations.table}
        on ${fields.userId} = ${oruRelations.fields.userId}
        and ${fields.organizationId} = ${oruRelations.fields.organizationId}
      left join ${organizationRoles.table}
        on ${oruRelations.fields.organizationRoleId} = ${organizationRoles.fields.id}
      where ${fields.userId} = ${userId}
      group by ${organizations.table}.id
    `);
  }
}

export default class OrganizationQueries extends SchemaQueries<
  OrganizationKeys,
  CreateOrganization,
  Organization
> {
  /** Queries for roles in the organization template. */
  roles = new SchemaQueries(this.pool, OrganizationRoles, { field: 'name', order: 'asc' });
  /** Queries for scopes in the organization template. */
  scopes = new SchemaQueries(this.pool, OrganizationScopes, { field: 'name', order: 'asc' });

  /** Queries for relations that connected with organization-related entities. */
  relations = {
    /** Queries for organization role - organization scope relations. */
    rolesScopes: new RelationQueries(
      this.pool,
      OrganizationRoleScopeRelations.table,
      OrganizationRoles,
      OrganizationScopes
    ),
    /** Queries for organization - user relations. */
    users: new UserRelationQueries(this.pool),
    /** Queries for organization - organization role - user relations. */
    rolesUsers: new RelationQueries(
      this.pool,
      OrganizationRoleUserRelations.table,
      Organizations,
      OrganizationRoles,
      Users
    ),
  };

  constructor(pool: CommonQueryMethods) {
    super(pool, Organizations);
  }
}
