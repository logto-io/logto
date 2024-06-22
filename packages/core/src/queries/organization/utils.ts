import { OrganizationRoles } from '@logto/schemas';
import { sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

/**
 * Build the SQL for aggregating the organization roles with basic information (id and name)
 * into a JSON array.
 *
 * @param as The alias of the aggregated roles. Defaults to `organizationRoles`.
 */
export const aggregateRoles = (as = 'organizationRoles') => {
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
};
