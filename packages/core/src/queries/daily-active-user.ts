import { DailyActiveUsers, type LicenseMonthlyUsage } from '@logto/schemas';
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

  /**
   * Count the distinct active users of the month starting at `lastMonthStart` and of the month
   * starting at `monthStart` so far, across every tenant except `excludedTenantId`.
   *
   * The table holds a row per issued access token, so this window reaches millions of rows on a
   * large deployment. One pass groups those rows by user and counts the groups per month on purpose:
   * a pair of `count(distinct)` aggregates over the same rows measured an order of magnitude slower,
   * and it would spend the whole statement timeout of the caller and take the other usage metrics
   * down with it.
   *
   * Only a pool that is not restricted to one tenant, i.e. `EnvSet.sharedPool`, sees every tenant.
   */
  const countMonthlyActiveUsersExcludingTenant = async ({
    lastMonthStart,
    monthStart,
    excludedTenantId,
  }: {
    lastMonthStart: Date;
    monthStart: Date;
    excludedTenantId: string;
  }): Promise<LicenseMonthlyUsage> => {
    const monthStartTimestamp = sql`to_timestamp(${monthStart.getTime()}::double precision / 1000)`;
    const { lastMonth, monthToDate } = await pool.one<
      Record<keyof LicenseMonthlyUsage, string>
    >(sql`
      select
        count(*) filter (where in_last_month) as last_month,
        count(*) filter (where in_month) as month_to_date
      from (
        select
          ${fields.userId},
          bool_or(${fields.date} < ${monthStartTimestamp}) as in_last_month,
          bool_or(${fields.date} >= ${monthStartTimestamp}) as in_month
        from ${table}
        where ${fields.date} >= to_timestamp(${lastMonthStart.getTime()}::double precision / 1000)
          and ${fields.tenantId} <> ${excludedTenantId}
        group by ${fields.userId}
      ) as users
    `);

    // `count` is a `bigint`, which comes back as a string.
    return { lastMonth: Number(lastMonth), monthToDate: Number(monthToDate) };
  };

  /**
   * Count the distinct active users of every UTC calendar month from `from` until `to`, across
   * every tenant except `excludedTenantId`. Both bounds are the first instant of a UTC month.
   *
   * Each month is counted on its own: its rows are found through the date index and grouped by user
   * in memory. Grouping the whole range by month and user at once sorts every row of the range,
   * which measured about ten times slower on a year of a large deployment's usage.
   *
   * Only a pool that is not restricted to one tenant, i.e. `EnvSet.sharedPool`, sees every tenant.
   */
  const countActiveUsersByMonthExcludingTenant = async ({
    from,
    to,
    excludedTenantId,
  }: {
    from: Date;
    to: Date;
    excludedTenantId: string;
  }): Promise<Map<string, number>> => {
    // The month starts are UTC `timestamp`s, so adding a month does not depend on the time zone of
    // the session.
    const rows = await pool.any<{ month: string; count: string }>(sql`
      select to_char(months.start, 'YYYY-MM') as month, users.count
      from generate_series(
        to_timestamp(${from.getTime()}::double precision / 1000) at time zone 'UTC',
        to_timestamp(${to.getTime()}::double precision / 1000) at time zone 'UTC'
          - interval '1 month',
        interval '1 month'
      ) as months(start)
      cross join lateral (
        select count(*)
        from (
          select ${fields.userId}
          from ${table}
          where ${fields.date} >= months.start at time zone 'UTC'
            and ${fields.date} < (months.start + interval '1 month') at time zone 'UTC'
            and ${fields.tenantId} <> ${excludedTenantId}
          group by ${fields.userId}
        ) as month_users
      ) as users
    `);

    // `count` is a `bigint`, which comes back as a string.
    return new Map(rows.map(({ month, count }) => [month, Number(count)]));
  };

  return {
    insertActiveUser,
    countActiveUsersByTimeInterval,
    getDailyActiveUserCountsByTimeInterval,
    countMonthlyActiveUsersExcludingTenant,
    countActiveUsersByMonthExcludingTenant,
  };
};
