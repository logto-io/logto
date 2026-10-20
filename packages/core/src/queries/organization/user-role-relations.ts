import {
  Organizations,
  OrganizationRoles,
  OrganizationScopes,
  OrganizationRoleScopeRelations,
  Users,
  OrganizationRoleUserRelations,
  type OrganizationScope,
  type ResourceScopeEntity,
  Scopes,
  OrganizationRoleResourceScopeRelations,
  Resources,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import RelationQueries from '#src/utils/RelationQueries.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

type OrganizationRoleRuleMatch = {
  organizationId: string;
  organizationRoleId: string;
};

export class UserRoleRelationQueries extends RelationQueries<
  [typeof Organizations, typeof OrganizationRoles, typeof Users]
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, OrganizationRoleUserRelations.table, Organizations, OrganizationRoles, Users);
  }

  /** Get the available scopes of a user in an organization. */
  async getUserScopes(
    organizationId: string,
    userId: string
  ): Promise<readonly OrganizationScope[]> {
    const { fields } = convertToIdentifiers(OrganizationRoleUserRelations, true);
    const roleScopeRelations = convertToIdentifiers(OrganizationRoleScopeRelations, true);
    const scopes = convertToIdentifiers(OrganizationScopes, true);

    return this.pool.any<OrganizationScope>(sql`
      select distinct on (${scopes.fields.id})
        ${sql.join(Object.values(scopes.fields), sql`, `)}
      from ${this.table}
      join ${roleScopeRelations.table}
        on ${roleScopeRelations.fields.organizationRoleId} = ${fields.organizationRoleId}
      join ${scopes.table}
        on ${scopes.fields.id} = ${roleScopeRelations.fields.organizationScopeId}
      where ${fields.organizationId} = ${organizationId}
      and ${fields.userId} = ${userId}
    `);
  }

  /**
   * Get the available resource scopes of a user in all organizations.
   * If `organizationId` is provided, it will only search in that organization.
   */
  async getUserResourceScopes(
    userId: string,
    resourceIndicator: string,
    organizationId?: string
  ): Promise<readonly ResourceScopeEntity[]> {
    const { fields } = convertToIdentifiers(OrganizationRoleUserRelations, true);
    const roleScopeRelations = convertToIdentifiers(OrganizationRoleResourceScopeRelations, true);
    const scopes = convertToIdentifiers(Scopes, true);
    const resources = convertToIdentifiers(Resources, true);

    return this.pool.any<ResourceScopeEntity>(sql`
      select distinct on (${scopes.fields.id})
        ${scopes.fields.id}, ${scopes.fields.name}
      from ${this.table}
      join ${roleScopeRelations.table}
        on ${roleScopeRelations.fields.organizationRoleId} = ${fields.organizationRoleId}
      join ${scopes.table}
        on ${scopes.fields.id} = ${roleScopeRelations.fields.scopeId}
      join ${resources.table}
        on ${resources.fields.id} = ${scopes.fields.resourceId}
      where ${fields.userId} = ${userId}
      and ${resources.fields.indicator} = ${resourceIndicator}
      ${conditionalSql(organizationId, (value) => sql`and ${fields.organizationId} = ${value}`)}
    `);
  }

  async hasUserOrganizationRole(
    userId: string,
    organizationRoleRuleMatches: readonly OrganizationRoleRuleMatch[]
  ): Promise<boolean> {
    if (organizationRoleRuleMatches.length === 0) {
      return false;
    }

    const { fields } = convertToIdentifiers(OrganizationRoleUserRelations, true);

    return this.pool.exists(sql`
      select 1
      from ${this.table}
      where ${fields.userId} = ${userId}
        and (${fields.organizationId}, ${fields.organizationRoleId}) in (${sql.join(
          organizationRoleRuleMatches.map(
            ({ organizationId, organizationRoleId }) =>
              sql`(${organizationId}, ${organizationRoleId})`
          ),
          sql`, `
        )})
    `);
  }

  /**
   * Insert organization user-role relations, ignoring ones that already exist, and return the
   * relations that were actually inserted. Callers use the returned rows to report an accurate
   * webhook delta instead of the requested role IDs.
   */
  async insertWithResult(
    ...data: ReadonlyArray<{
      organizationId: string;
      userId: string;
      organizationRoleId: string;
    }>
  ): Promise<
    ReadonlyArray<{ organizationId: string; userId: string; organizationRoleId: string }>
  > {
    if (data.length === 0) {
      return [];
    }

    const { table, fields } = convertToIdentifiers(OrganizationRoleUserRelations);

    return this.pool.any<{
      organizationId: string;
      userId: string;
      organizationRoleId: string;
    }>(sql`
      insert into ${table} (
        ${fields.organizationId},
        ${fields.userId},
        ${fields.organizationRoleId}
      )
      values ${sql.join(
        data.map(
          ({ organizationId, userId, organizationRoleId }) =>
            sql`(${organizationId}, ${userId}, ${organizationRoleId})`
        ),
        sql`, `
      )}
      on conflict do nothing
      returning
        ${fields.organizationId} as "organizationId",
        ${fields.userId} as "userId",
        ${fields.organizationRoleId} as "organizationRoleId"
    `);
  }

  /** Replace the roles of a user in an organization. */
  async replace(organizationId: string, userId: string, roleIds: string[]) {
    const users = convertToIdentifiers(Users);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations);

    return this.pool.transaction(async (transaction) => {
      // Lock user
      await transaction.query(sql`
        select 1
        from ${users.table}
        where ${users.fields.id} = ${userId}
        for update
      `);

      // Delete old relations
      await transaction.query(sql`
        delete from ${relations.table}
        where ${relations.fields.organizationId} = ${organizationId}
        and ${relations.fields.userId} = ${userId}
      `);

      // Insert new relations
      if (roleIds.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${relations.table} (
          ${relations.fields.organizationId},
          ${relations.fields.userId},
          ${relations.fields.organizationRoleId}
        )
        values ${sql.join(
          roleIds.map((roleId) => sql`(${organizationId}, ${userId}, ${roleId})`),
          sql`, `
        )}
      `);
    });
  }

  /**
   * Replace the roles of a user in an organization and return the role IDs that were actually
   * added and removed.
   *
   * Unlike {@link replace}, this writes only the rows that change. That keeps existing rows (and
   * any cascades attached to them) untouched and produces an accurate webhook delta.
   */
  async replaceWithDelta(
    organizationId: string,
    userId: string,
    roleIds: readonly string[]
  ): Promise<{ added: readonly string[]; removed: readonly string[] }> {
    const users = convertToIdentifiers(Users);
    const relations = convertToIdentifiers(OrganizationRoleUserRelations);

    return this.pool.transaction(async (transaction) => {
      // Lock user, matching `replace()`.
      await transaction.query(sql`
        select 1
        from ${users.table}
        where ${users.fields.id} = ${userId}
        for update
      `);

      const nextIds = sql.array(roleIds, 'varchar');

      const row = await transaction.one<{
        added: readonly string[];
        removed: readonly string[];
      }>(sql`
        with
          next_set as (
            select unnest(${nextIds}) as id
          ),
          existing as (
            select ${relations.fields.organizationRoleId} as id
            from ${relations.table}
            where ${relations.fields.organizationId} = ${organizationId}
              and ${relations.fields.userId} = ${userId}
          ),
          inserted as (
            insert into ${relations.table} (
              ${relations.fields.organizationId},
              ${relations.fields.userId},
              ${relations.fields.organizationRoleId}
            )
            select ${organizationId}, ${userId}, next_set.id
            from next_set
            left join existing on existing.id = next_set.id
            where existing.id is null
            on conflict do nothing
            returning ${relations.fields.organizationRoleId} as id
          ),
          deleted as (
            delete from ${relations.table}
            where ${relations.fields.organizationId} = ${organizationId}
              and ${relations.fields.userId} = ${userId}
              and not exists (
                select 1 from next_set where next_set.id = ${relations.fields.organizationRoleId}
              )
            returning ${relations.fields.organizationRoleId} as id
          )
        select
          coalesce((select array_agg(id) from inserted), array[]::varchar[]) as added,
          coalesce((select array_agg(id) from deleted), array[]::varchar[]) as removed
      `);

      return { added: row.added, removed: row.removed };
    });
  }
}
