import {
  Organizations,
  OrganizationRoles,
  Applications,
  OrganizationRoleApplicationRelations,
  type OrganizationScope,
  OrganizationRoleScopeRelations,
  OrganizationScopes,
  OrganizationRoleResourceScopeRelations,
  Scopes,
  Resources,
  type Scope,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import RelationQueries from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

export class ApplicationRoleRelationQueries extends RelationQueries<
  [typeof Organizations, typeof OrganizationRoles, typeof Applications]
> {
  constructor(pool: CommonQueryMethods) {
    super(
      pool,
      OrganizationRoleApplicationRelations.table,
      Organizations,
      OrganizationRoles,
      Applications
    );
  }

  /**
   * Get all the organization scopes of an application in an organization. Scopes are unique by
   * their IDs.
   */
  async getApplicationScopes(
    organizationId: string,
    applicationId: string
  ): Promise<readonly OrganizationScope[]> {
    const { fields } = convertToIdentifiers(OrganizationRoleApplicationRelations, true);
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
      and ${fields.applicationId} = ${applicationId}
    `);
  }

  /**
   * Get all the resource scopes of an application in an organization. Scopes are unique by their
   * IDs.
   */
  async getApplicationResourceScopes(
    organizationId: string,
    applicationId: string,
    resourceIndicator: string
  ): Promise<readonly Scope[]> {
    const { fields } = convertToIdentifiers(OrganizationRoleApplicationRelations, true);
    const roleScopeRelations = convertToIdentifiers(OrganizationRoleResourceScopeRelations, true);
    const resources = convertToIdentifiers(Resources, true);
    const scopes = convertToIdentifiers(Scopes, true);

    return this.pool.any<Scope>(sql`
      select distinct on (${scopes.fields.id})
        ${sql.join(Object.values(scopes.fields), sql`, `)}
      from ${this.table}
      join ${roleScopeRelations.table}
        on ${roleScopeRelations.fields.organizationRoleId} = ${fields.organizationRoleId}
      join ${scopes.table}
        on ${scopes.fields.id} = ${roleScopeRelations.fields.scopeId}
      join ${resources.table}
        on ${resources.fields.id} = ${scopes.fields.resourceId}
      where ${fields.organizationId} = ${organizationId}
      and ${fields.applicationId} = ${applicationId}
      and ${resources.fields.indicator} = ${resourceIndicator}
    `);
  }

  /** Replace the roles of an application in an organization. */
  async replace(organizationId: string, applicationId: string, roleIds: readonly string[]) {
    const applications = convertToIdentifiers(Applications);
    const relations = convertToIdentifiers(OrganizationRoleApplicationRelations);

    return this.pool.transaction(async (transaction) => {
      // Lock application
      await transaction.query(sql`
        select 1
        from ${applications.table}
        where ${applications.fields.id} = ${applicationId}
        for update
      `);

      // Delete old relations
      await transaction.query(sql`
        delete from ${relations.table}
        where ${relations.fields.organizationId} = ${organizationId}
        and ${relations.fields.applicationId} = ${applicationId}
      `);

      // Insert new relations
      if (roleIds.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${relations.table} (
          ${relations.fields.organizationId},
          ${relations.fields.applicationId},
          ${relations.fields.organizationRoleId}
        )
        values ${sql.join(
          roleIds.map((roleId) => sql`(${organizationId}, ${applicationId}, ${roleId})`),
          sql`, `
        )}
      `);
    });
  }
}
