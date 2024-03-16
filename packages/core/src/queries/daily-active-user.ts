import { DailyActiveUsers } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(DailyActiveUsers);

export const createDailyActiveUsersQueries = (pool: CommonQueryMethods) => {
  const insertActiveUser = buildInsertIntoWithPool(pool)(DailyActiveUsers, {
    onConflict: { ignore: true },
  });

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

  return {
    insertActiveUser,
    countActiveUsersByTimeInterval,
    getDailyActiveUserCountsByTimeInterval,
  };
};
