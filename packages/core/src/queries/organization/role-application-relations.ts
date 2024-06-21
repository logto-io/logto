import {
  Organizations,
  OrganizationRoles,
  Applications,
  OrganizationRoleApplicationRelations,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import RelationQueries from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

export class RoleApplicationRelationQueries extends RelationQueries<
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
