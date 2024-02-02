import { DailyActiveUsers } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql, type CommonQueryMethods } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { table, fields } = convertToIdentifiers(DailyActiveUsers);

export const createDailyActiveUsersQueries = (pool: CommonQueryMethods) => {
  const insertActiveUser = buildInsertIntoWithPool(pool)(DailyActiveUsers, {
    onConflict: { ignore: true },
  });

  const getDailyActiveUserCountsByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.any<{ date: string; count: number }>(sql`
      select date(${fields.date}), count(distinct(${fields.userId}))
      from ${table}
      where ${fields.date} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.date} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
      group by date(${fields.date})
    `);

  const countActiveUsersByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.one<{ count: number }>(sql`
      select count(distinct(${fields.userId}))
      from ${table}
      where ${fields.date} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.date} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
    `);

  return {
    insertActiveUser,
    getDailyActiveUserCountsByTimeInterval,
    countActiveUsersByTimeInterval,
  };
};
