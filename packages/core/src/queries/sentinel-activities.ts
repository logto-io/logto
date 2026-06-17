import {
  SentinelActivities,
  type SentinelActivity,
  type SentinelActivityAction,
  type SentinelActivityTargetType,
} from '@logto/schemas';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '../database/insert-into.js';
import { convertToIdentifiers } from '../utils/sql.js';

const { table, fields } = convertToIdentifiers(SentinelActivities, true);

type CountActivitiesQuery = {
  targetType: SentinelActivityTargetType;
  targetHash: string;
  action: SentinelActivityAction;
  /** The rolling window, in seconds, to count activities within. */
  windowSeconds: number;
};

export const createSentinelActivitiesQueries = (pool: CommonQueryMethods) => {
  /**
   * Insert a sentinel activity row. Reused by both the failure-based sentinel and the
   * message rate guard — the table is a shared activity log.
   */
  const insertActivity = buildInsertIntoWithPool(pool)(SentinelActivities);

  /**
   * Count the activities matching the given target and action within the rolling window.
   * Used by the message rate guard to evaluate the per-recipient send cap.
   */
  const countActivities = async ({
    targetType,
    targetHash,
    action,
    windowSeconds,
  }: CountActivitiesQuery): Promise<number> =>
    // Postgres returns count(*) as a bigint that Slonik surfaces as a string; coerce to a number.
    Number(
      await pool.oneFirst<string>(sql`
        select count(*)
        from ${table}
        where ${fields.targetType} = ${targetType}
          and ${fields.targetHash} = ${targetHash}
          and ${fields.action} = ${action}
          and ${fields.createdAt} > now() - make_interval(secs => ${windowSeconds})
      `)
    );

  /**
   * Delete all records in the `sentinel_activities` table that match the given target within
   * 1 hour. This should unblock the user if they are locked.
   */
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
    insertActivity,
    countActivities,
    deleteActivities,
  };
};
