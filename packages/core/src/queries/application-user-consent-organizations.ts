import {
  ApplicationUserConsentOrganizations,
  Applications,
  Organizations,
  Users,
} from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import RelationQueries from '#src/utils/RelationQueries.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

class ApplicationUserConsentOrganizationsQuery extends RelationQueries<
  [typeof Applications, typeof Users, typeof Organizations]
> {
  constructor(pool: CommonQueryMethods) {
    super(pool, ApplicationUserConsentOrganizations.table, Applications, Users, Organizations);
  }

  /** Replace the organizations of a user consented for the application */
  async replace(applicationId: string, userId: string, organizationIds: string[]) {
    const users = convertToIdentifiers(Users);
    const relations = convertToIdentifiers(ApplicationUserConsentOrganizations);

    return this.pool.transaction(async (transaction) => {
      // Lock user
      await transaction.query(sql`
        select id
        from ${users.table}
        where ${users.fields.id} = ${userId}
        for update
      `);

      // Delete existing relations
      await transaction.query(sql`
        delete from ${relations.table}
        where ${relations.fields.applicationId} = ${applicationId}
        and ${relations.fields.userId} = ${userId}
      `);

      // Insert new relations
      if (organizationIds.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${relations.table} (
          ${relations.fields.applicationId},
          ${relations.fields.organizationId},
          ${relations.fields.userId}
        ) values ${sql.join(
          organizationIds.map(
            (organizationId) => sql`(${applicationId}, ${organizationId}, ${userId})`
          ),
          sql`, `
        )}
      `);
    });
  }
}

export default ApplicationUserConsentOrganizationsQuery;
