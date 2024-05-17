import { dateRegex } from '@logto/core-kit';
import { getNewUsersResponseGuard, getActiveUsersResponseGuard } from '@logto/schemas';
import { endOfDay, format, subDays } from 'date-fns';
import { number, object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

const getDateString = (date: Date | number) => format(date, 'yyyy-MM-dd');

const indices = (length: number) => [...Array.from({ length }).keys()];

const getEndOfDayTimestamp = (date: Date | number) => endOfDay(date).valueOf();

export default function dashboardRoutes<T extends ManagementApiRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    dailyActiveUsers: { countActiveUsersByTimeInterval, getDailyActiveUserCountsByTimeInterval },
    users: { countUsers, getDailyNewUserCountsByTimeInterval },
  } = queries;

  router.get(
    '/dashboard/users/total',
    koaGuard({
      response: object({
        totalUserCount: number(),
      }),
      status: [200],
    }),
    async (ctx, next) => {
      const { count: totalUserCount } = await countUsers({});
      ctx.body = { totalUserCount };

      return next();
    }
  );

  router.get(
    '/dashboard/users/new',
    koaGuard({
      response: getNewUsersResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const today = Date.now();
      const dailyNewUserCounts = await getDailyNewUserCountsByTimeInterval(
        // (14 days ago 23:59:59.999, today 23:59:59.999]
        getEndOfDayTimestamp(subDays(today, 14)),
        getEndOfDayTimestamp(today)
      );

      const last14DaysNewUserCounts = new Map(
        dailyNewUserCounts.map(({ date, count }) => [date, count])
      );

      const todayNewUserCount = last14DaysNewUserCounts.get(getDateString(today)) ?? 0;
      const yesterday = subDays(today, 1);
      const yesterdayNewUserCount = last14DaysNewUserCounts.get(getDateString(yesterday)) ?? 0;
      const todayDelta = todayNewUserCount - yesterdayNewUserCount;

      const last7DaysNewUserCount = indices(7)
        .map((index) => getDateString(subDays(today, index)))
        .reduce((sum, date) => sum + (last14DaysNewUserCounts.get(date) ?? 0), 0);
      const newUserCountFrom13DaysAgoTo7DaysAgo = indices(7)
        .map((index) => getDateString(subDays(today, index + 7)))
        .reduce((sum, date) => sum + (last14DaysNewUserCounts.get(date) ?? 0), 0);
      const last7DaysDelta = last7DaysNewUserCount - newUserCountFrom13DaysAgoTo7DaysAgo;

      ctx.body = {
        today: {
          count: todayNewUserCount,
          delta: todayDelta,
        },
        last7Days: {
          count: last7DaysNewUserCount,
          delta: last7DaysDelta,
        },
      };

      return next();
    }
  );

  router.get(
    '/dashboard/users/active',
    koaGuard({
      query: object({ date: string().regex(dateRegex).optional() }),
      response: getActiveUsersResponseGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const {
        query: { date },
      } = ctx.guard;

      const targetDay = date ? new Date(date) : new Date(); // Defaults to today
      const [
        // DAU: Daily Active User
        last30DauCounts,
        // WAU: Weekly Active User
        { count: previousWAU },
        { count: wau },
        // MAU: Monthly Active User
        { count: previousMAU },
        { count: mau },
      ] = await Promise.all([
        getDailyActiveUserCountsByTimeInterval(
          // (30 days ago 23:59:59.999, target day 23:59:59.999]
          getEndOfDayTimestamp(subDays(targetDay, 30)),
          getEndOfDayTimestamp(targetDay)
        ),
        countActiveUsersByTimeInterval(
          // (14 days ago 23:59:59.999, 7 days ago 23:59:59.999]
          getEndOfDayTimestamp(subDays(targetDay, 14)),
          getEndOfDayTimestamp(subDays(targetDay, 7))
        ),
        countActiveUsersByTimeInterval(
          // (7 days ago 23:59:59.999, target day 23:59:59.999]
          getEndOfDayTimestamp(subDays(targetDay, 7)),
          getEndOfDayTimestamp(targetDay)
        ),
        countActiveUsersByTimeInterval(
          // (60 days ago 23:59:59.999, 30 days ago 23:59:59.999]
          getEndOfDayTimestamp(subDays(targetDay, 60)),
          getEndOfDayTimestamp(subDays(targetDay, 30))
        ),
        countActiveUsersByTimeInterval(
          // (30 days ago 23:59:59.999, target day 23:59:59.999]
          getEndOfDayTimestamp(subDays(targetDay, 30)),
          getEndOfDayTimestamp(targetDay)
        ),
      ]);

      const previousDate = getDateString(subDays(targetDay, 1));
      const targetDate = getDateString(targetDay);

      const previousDAU = last30DauCounts.find(({ date }) => date === previousDate)?.count ?? 0;
      const dau = last30DauCounts.find(({ date }) => date === targetDate)?.count ?? 0;

      const dauCurve = indices(30).map((index) => {
        const dateString = getDateString(subDays(targetDay, 29 - index));
        const count = last30DauCounts.find(({ date }) => date === dateString)?.count ?? 0;

        return { date: dateString, count };
      });

      ctx.body = {
        dauCurve,
        dau: {
          count: dau,
          delta: dau - previousDAU,
        },
        wau: {
          count: wau,
          delta: wau - previousWAU,
        },
        mau: {
          count: mau,
          delta: mau - previousMAU,
        },
      };

      return next();
    }
  );
}
