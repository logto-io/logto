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
  type OrganizationWithRoles,
  type UserWithOrganizationRoles,
  type FeaturedUser,
} from '@logto/schemas';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';

import { type SearchOptions, buildSearchSql, expandFields } from '#src/database/utils.js';
import RelationQueries, {
  type GetEntitiesOptions,
  TwoRelationsQueries,
} from '#src/utils/RelationQueries.js';
import SchemaQueries from '#src/utils/SchemaQueries.js';

import { type userSearchKeys } from './user.js';

/** The query class for the organization - user relation. */
class UserRelationQueries extends TwoRelationsQueries<typeof Organizations, typeof Users> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationUserRelations.table, Organizations, Users);
  }

  async getFeatured(
    organizationId: string
  ): Promise<[totalNumber: number, users: readonly FeaturedUser[]]> {
    const users = convertToIdentifiers(Users, true);
    const relations = convertToIdentifiers(OrganizationUserRelations, true);
    const mainSql = sql`
      from ${relations.table}
      left join ${users.table}
        on ${relations.fields.userId} = ${users.fields.id}
      where ${relations.fields.organizationId} = ${organizationId}
    `;
    const [{ count }, data] = await Promise.all([
      this.pool.one<{ count: string }>(sql`
        select count(*)
        ${mainSql}
      `),
      this.pool.any<FeaturedUser>(sql`
        select
          ${users.fields.id},
          ${users.fields.avatar},
          ${users.fields.name}
        ${mainSql}
        limit 3
      `),
    ]);

    return [Number(count), data];
  }

  /**
   * Find all organizations that the user is a member of.
   *
   * @returns A Promise that resolves to an array of organization with roles. Each item
   * is an organization object with `organizationRoles` property.
   * @see {@link OrganizationWithRoles} for the definition of an organization with roles.
   */
  async getOrganizationsByUserId(userId: string): Promise<Readonly<OrganizationWithRoles[]>> {
    const roles = convertToIdentifiers(OrganizationRoles, true);
    const organizations = convertToIdentifiers(Organizations, true);
    const { fields } = convertToIdentifiers(OrganizationUserRelations, true);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations, true);

    return this.pool.any<OrganizationWithRoles>(sql`
      select
        ${expandFields(Organizations, true)},
        ${this.#aggregateRoles()}
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

  /** Get the users in an organization and their roles. */
  async getUsersByOrganizationId(
    organizationId: string,
    { limit, offset }: GetEntitiesOptions,
    search?: SearchOptions<(typeof userSearchKeys)[number]>
  ): Promise<[totalNumber: number, entities: Readonly<UserWithOrganizationRoles[]>]> {
    const roles = convertToIdentifiers(OrganizationRoles, true);
    const users = convertToIdentifiers(Users, true);
    const { fields } = convertToIdentifiers(OrganizationUserRelations, true);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations, true);

    const [{ count }, entities] = await Promise.all([
      this.pool.one<{ count: string }>(sql`
        select count(*)
        from ${this.table}
        left join ${users.table}
          on ${fields.userId} = ${users.fields.id}
        where ${fields.organizationId} = ${organizationId}
        ${buildSearchSql(Users, search, sql`and `)}
      `),
      this.pool.any<UserWithOrganizationRoles>(sql`
        select
          ${users.table}.*,
          ${this.#aggregateRoles()}
        from ${this.table}
        left join ${users.table}
          on ${fields.userId} = ${users.fields.id}
        left join ${relations.table}
          on ${fields.userId} = ${relations.fields.userId}
          and ${fields.organizationId} = ${relations.fields.organizationId}
        left join ${roles.table}
          on ${relations.fields.organizationRoleId} = ${roles.fields.id}
        where ${fields.organizationId} = ${organizationId}
        ${buildSearchSql(Users, search, sql`and `)}
        group by ${users.table}.id
        limit ${limit}
        offset ${offset}
      `),
    ]);

    return [Number(count), entities];
  }

  /**
   * Build the SQL for aggregating the organization roles with basic information (id and name)
   * into a JSON array.
   *
   * @param as The alias of the aggregated roles. Defaults to `organizationRoles`.
   */
  #aggregateRoles(as = 'organizationRoles') {
    const roles = convertToIdentifiers(OrganizationRoles, true);

    return sql`
      coalesce(
        json_agg(
          json_build_object(
            'id', ${roles.fields.id},
            'name', ${roles.fields.name}
          ) order by ${roles.fields.name}
        ) filter (where ${roles.fields.id} is not null), -- left join could produce nulls as roles
        '[]'
      ) as ${sql.identifier([as])}
    `;
  }
}

class OrganizationRolesQueries extends SchemaQueries<
  OrganizationRoleKeys,
  CreateOrganizationRole,
  OrganizationRole
> {
  override async findById(id: string): Promise<Readonly<OrganizationRoleWithScopes>> {
    return this.pool.one(this.#findWithScopesSql(id));
  }

  override async findAll(
    limit: number,
    offset: number,
    search?: SearchOptions<OrganizationRoleKeys>
  ): Promise<[totalNumber: number, rows: Readonly<OrganizationRoleWithScopes[]>]> {
    return Promise.all([
      this.findTotalNumber(search),
      this.pool.any(this.#findWithScopesSql(undefined, limit, offset, search)),
    ]);
  }

  #findWithScopesSql(
    roleId?: string,
    limit = 1,
    offset = 0,
    search?: SearchOptions<OrganizationRoleKeys>
  ) {
    const { table, fields } = convertToIdentifiers(OrganizationRoles, true);
    const relations = convertToIdentifiers(OrganizationRoleScopeRelations, true);
    const scopes = convertToIdentifiers(OrganizationScopes, true);

    return sql<OrganizationRoleWithScopes>`
      select
        ${table}.*,
        coalesce(
          json_agg(
            json_build_object(
              'id', ${scopes.fields.id},
              'name', ${scopes.fields.name}
            ) order by ${scopes.fields.name}
          ) filter (where ${scopes.fields.id} is not null),
          '[]'
        ) as scopes -- left join could produce nulls as scopes
      from ${table}
      left join ${relations.table}
        on ${relations.fields.organizationRoleId} = ${fields.id}
      left join ${scopes.table}
        on ${relations.fields.organizationScopeId} = ${scopes.fields.id}
      ${conditionalSql(roleId, (id) => {
        return sql`where ${fields.id} = ${id}`;
      })}
      ${buildSearchSql(OrganizationRoles, search)}
      group by ${fields.id}
      ${conditionalSql(this.orderBy, ({ field, order }) => {
        return sql`order by ${fields[field]} ${order === 'desc' ? sql`desc` : sql`asc`}`;
      })}
      limit ${limit}
      offset ${offset}
    `;
  }
}

class RoleUserRelationQueries extends RelationQueries<
  [typeof Organizations, typeof OrganizationRoles, typeof Users]
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationRoleUserRelations.table, Organizations, OrganizationRoles, Users);
  }

  /** Replace the roles of a user in an organization. */
  async replace(organizationId: string, userId: string, roleIds: string[]) {
    const users = convertToIdentifiers(Users);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations);

    return this.pool.transaction(async (transaction) => {
      // Lock user
      await transaction.query(sql`
        select id
        from ${users.table}
        where ${users.fields.id} = ${userId}
        for update
      `);

      // Delete old relations
      await transaction.query(sql`
        delete from ${relations.table}
        where ${relations.fields.userId} = ${userId}
        and ${relations.fields.organizationId} = ${organizationId}
      `);

      // Insert new relations
      if (roleIds.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${relations.table} (
          ${relations.fields.userId},
          ${relations.fields.organizationId},
          ${relations.fields.organizationRoleId}
        )
         values ${sql.join(
           roleIds.map((roleId) => sql`(${userId}, ${organizationId}, ${roleId})`),
           sql`, `
         )}
      `);
    });
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
    rolesScopes: new TwoRelationsQueries(
      this.pool,
      OrganizationRoleScopeRelations.table,
      OrganizationRoles,
      OrganizationScopes
    ),
    /** Queries for organization - user relations. */
    users: new UserRelationQueries(this.pool),
    /** Queries for organization - organization role - user relations. */
    rolesUsers: new RoleUserRelationQueries(this.pool),
  };

  constructor(pool: CommonQueryMethods) {
    super(pool, Organizations);
  }
}
