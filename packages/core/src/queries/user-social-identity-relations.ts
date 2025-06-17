import { type UserSocialIdentityRelation, UserSocialIdentityRelations } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers } from '../utils/sql.js';

const { table, fields } = convertToIdentifiers(UserSocialIdentityRelations);

/**
 * The `UserSocialIdentityRelation` table is automatically synchronized with the `Users` table
 * through a database trigger. This table serves as a read-only view of user social identity IDs,
 * it is designed to serve efficient querying and joining with other tables on user social identities.
 *
 * Important: This table should only be queried for reading data. Any write operations
 * should be performed on the `Users` table instead, as the trigger will handle the synchronization.
 */
export const createUserSocialIdentityRelationsQueries = (pool: CommonQueryMethods) => {
  const findUserSocialIdentityIdsByUserId = async (userId: string) => {
    return pool.any<UserSocialIdentityRelation>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.userId}=${userId}
    `);
  };

  return {
    findUserSocialIdentityIdsByUserId,
  };
};
