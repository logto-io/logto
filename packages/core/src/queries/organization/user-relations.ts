import {
  Organizations,
  OrganizationRoles,
  Users,
  OrganizationUserRelations,
  OrganizationRoleUserRelations,
  type OrganizationWithRoles,
  type UserWithOrganizationRoles,
  type FeaturedUser,
  userInfoSelectFields,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { type SearchOptions, buildSearchSql, expandFields } from '#src/database/utils.js';
import { type GetEntitiesOptions, TwoRelationsQueries } from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { type userSearchKeys } from '../user.js';

import { aggregateRoles } from './utils.js';

/** The query class for the organization - user relation. */
export class UserRelationQueries extends TwoRelationsQueries<typeof Organizations, typeof Users> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationUserRelations.table, Organizations, Users);
  }

  /**
   * Given a candidate set of user IDs, return the subset that already have a
   * row in `organization_user_relations` for the organization.
   *
   * Bounded by `userIds.length` (always the request body). Uses the
   * `(organization_id, user_id)` primary-key index.
   */
  async getExistingUserIds(organizationId: string, userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) {
      return [];
    }

    const { fields } = convertToIdentifiers(OrganizationUserRelations, true);
    const rows = await this.pool.any<{ userId: string }>(sql`
      select ${fields.userId}
      from ${this.table}
      where ${fields.organizationId} = ${organizationId}
        and ${fields.userId} = any(${sql.array(userIds, 'varchar')})
    `);

    return rows.map((row) => row.userId);
  }

  async isMember(organizationId: string, email: string): Promise<boolean> {
    const users = convertToIdentifiers(Users, true);
    const relations = convertToIdentifiers(OrganizationUserRelations, true);

    return this.pool.exists(sql`
      select 1
      from ${relations.table}
      join ${users.table}
        on ${relations.fields.userId} = ${users.fields.id}
      where ${relations.fields.organizationId} = ${organizationId}
      and ${users.fields.primaryEmail} = ${email}
    `);
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
        ${aggregateRoles()}
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

  /** Get the users in an organization with their organization roles. */
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
      // Aggregate roles via LATERAL so the per-user role lookup runs at most `limit` times
      // instead of once over the full join. `order by` is explicit because the prior
      // GROUP BY's ordering was incidental (Postgres does not guarantee GROUP BY ordering)
      // and the rewrite removes the implementation accident that made it appear stable.
      this.pool.any<UserWithOrganizationRoles>(sql`
        select
          ${sql.join(
            userInfoSelectFields.map((field) => users.fields[field]),
            sql`, `
          )},
          user_roles.${sql.identifier(['organizationRoles'])}
        from ${this.table}
        left join ${users.table}
          on ${fields.userId} = ${users.fields.id}
        left join lateral (
          select coalesce(
            json_agg(
              json_build_object(
                'id', ${roles.fields.id},
                'name', ${roles.fields.name}
              )
              order by ${roles.fields.name}
            ),
            '[]'::json
          ) as ${sql.identifier(['organizationRoles'])}
          from ${relations.table}
          join ${roles.table}
            on ${relations.fields.organizationRoleId} = ${roles.fields.id}
          where ${relations.fields.organizationId} = ${organizationId}
            and ${relations.fields.userId} = ${users.fields.id}
        ) as user_roles on true
        where ${fields.organizationId} = ${organizationId}
        ${buildSearchSql(Users, search, sql`and `)}
        order by ${fields.userId}
        limit ${limit}
        offset ${offset}
      `),
    ]);

    return [Number(count), entities];
  }
}
