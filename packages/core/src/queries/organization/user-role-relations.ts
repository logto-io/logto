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
}
