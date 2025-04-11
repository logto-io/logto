import {
  SentinelActivities,
  type SentinelActivity,
  type SentinelActivityTargetType,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '../utils/sql.js';

const { table, fields } = convertToIdentifiers(SentinelActivities, true);

/**
 * Delete all records in the `sentinel_activities` table that match the given target within 1 hour.
 * This should unblock the user if they are locked.
 */
export const createSentinelActivitiesQueries = (pool: CommonQueryMethods) => {
  const deleteActivities = async (
    targetType: SentinelActivityTargetType,
    targetHashes: string[]
  ) => {
    return pool.query<SentinelActivity>(sql`
      delete from ${table}
      where ${fields.targetType} = ${targetType}
        and ${fields.targetHash} = any(${sql.array(targetHashes, 'varchar')})
        and ${fields.createdAt} > now() - interval '1 hour'
    `);
  };

  return {
    deleteActivities,
  };
};
