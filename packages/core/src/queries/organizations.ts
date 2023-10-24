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
  type OrganizationRoleKeys,
  type CreateOrganizationRole,
  type OrganizationRole,
  type OrganizationRoleWithScopes,
} from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
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
    const roles = convertToIdentifiers(OrganizationRoles, true);
    const organizations = convertToIdentifiers(Organizations, true);
    const { fields } = convertToIdentifiers(OrganizationUserRelations, true);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations, true);

    return this.pool.any<OrganizationWithRoles>(sql`
      select
        ${organizations.table}.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', ${roles.fields.id},
              'name', ${roles.fields.name}
            )
          ) filter (where ${roles.fields.id} is not null), -- left join could produce nulls
          '[]'
        ) as roles
      from ${this.table}
      left join ${organizations.table}
        on ${fields.organizationId} = ${organizations.fields.id}
      left join ${relations.table}
        on ${fields.userId} = ${relations.fields.userId}
        and ${fields.organizationId} = ${relations.fields.organizationId}
      left join ${roles.table}
        on ${relations.fields.organizationRoleId} = ${roles.fields.id}
      where ${fields.userId} = ${userId}
      group by ${organizations.table}.id
    `);
  }
}

class OrganizationRolesQueries extends SchemaQueries<
  OrganizationRoleKeys,
  CreateOrganizationRole,
  OrganizationRole
> {
  async findAllWithScopes(
    limit: number,
    offset: number
  ): Promise<Readonly<OrganizationRoleWithScopes[]>> {
    const { table, fields } = convertToIdentifiers(OrganizationRoles, true);
    const relations = convertToIdentifiers(OrganizationRoleScopeRelations, true);
    const scopes = convertToIdentifiers(OrganizationScopes, true);

    return this.pool.any(sql`
      select
        ${table}.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', ${scopes.fields.id},
              'name', ${scopes.fields.name}
            )
          ) filter (where ${scopes.fields.id} is not null),
          '[]'
        ) as scopes -- left join could produce nulls as scopes
      from ${table}
      left join ${relations.table}
        on ${relations.fields.organizationRoleId} = ${fields.id}
      left join ${scopes.table}
        on ${relations.fields.organizationScopeId} = ${scopes.fields.id}
      group by ${fields.id}
      ${conditionalSql(this.orderBy, ({ field, order }) => {
        return sql`order by ${fields[field]} ${order === 'desc' ? sql`desc` : sql`asc`}`;
      })}
      limit ${limit}
      offset ${offset}
    `);
  }
}

export default class OrganizationQueries extends SchemaQueries<
  OrganizationKeys,
  CreateOrganization,
  Organization
> {
  /** Queries for roles in the organization template. */
  roles = new OrganizationRolesQueries(this.pool, OrganizationRoles, {
    field: 'name',
    order: 'asc',
  });

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
