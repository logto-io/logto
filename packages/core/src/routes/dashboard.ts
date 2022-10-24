import { dateRegex } from '@logto/core-kit';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import {
  countActiveUsersByTimeInterval,
  getDailyActiveUserCountsByTimeInterval,
} from '@/queries/log';
import { countUsers, getDailyNewUserCountsByTimeInterval } from '@/queries/user';

import type { AuthedRouter } from './types';

const getDateString = (day: Dayjs) => day.format('YYYY-MM-DD');

const indices = (length: number) => [...Array.from({ length }).keys()];

const lastTimestampOfDay = (day: Dayjs) => day.endOf('day').valueOf();

export default function dashboardRoutes<T extends AuthedRouter>(router: T) {
  router.get('/dashboard/users/total', async (ctx, next) => {
    const { count: totalUserCount } = await countUsers();
    ctx.body = { totalUserCount };

    return next();
  });

  router.get('/dashboard/users/new', async (ctx, next) => {
    const today = dayjs();
    const dailyNewUserCounts = await getDailyNewUserCountsByTimeInterval(
      // (14 days ago 23:59:59.999, today 23:59:59.999]
      lastTimestampOfDay(today.subtract(14, 'day')),
      lastTimestampOfDay(today)
    );

    const last14DaysNewUserCounts = new Map(
      dailyNewUserCounts.map(({ date, count }) => [date, count])
    );

    const todayNewUserCount = last14DaysNewUserCounts.get(getDateString(today)) ?? 0;
    const yesterday = today.subtract(1, 'day');
    const yesterdayNewUserCount = last14DaysNewUserCounts.get(getDateString(yesterday)) ?? 0;
    const todayDelta = todayNewUserCount - yesterdayNewUserCount;

    const last7DaysNewUserCount = indices(7)
      .map((index) => getDateString(today.subtract(index, 'day')))
      .reduce((sum, date) => sum + (last14DaysNewUserCounts.get(date) ?? 0), 0);
    const newUserCountFrom13DaysAgoTo7DaysAgo = indices(7)
      .map((index) => getDateString(today.subtract(7 + index, 'day')))
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
  });

  router.get(
    '/dashboard/users/active',
    koaGuard({
      query: object({ date: string().regex(dateRegex).optional() }),
    }),
    async (ctx, next) => {
      const {
        query: { date },
      } = ctx.guard;

      const targetDay = date ? dayjs(date) : dayjs(); // Defaults to today
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
          lastTimestampOfDay(targetDay.subtract(30, 'day')),
          lastTimestampOfDay(targetDay)
        ),
        countActiveUsersByTimeInterval(
          // (14 days ago 23:59:59.999, 7 days ago 23:59:59.999]
          lastTimestampOfDay(targetDay.subtract(14, 'day')),
          lastTimestampOfDay(targetDay.subtract(7, 'day'))
        ),
        countActiveUsersByTimeInterval(
          // (7 days ago 23:59:59.999, target day 23:59:59.999]
          lastTimestampOfDay(targetDay.subtract(7, 'day')),
          lastTimestampOfDay(targetDay)
        ),
        countActiveUsersByTimeInterval(
          // (60 days ago 23:59:59.999, 30 days ago 23:59:59.999]
          lastTimestampOfDay(targetDay.subtract(60, 'day')),
          lastTimestampOfDay(targetDay.subtract(30, 'day'))
        ),
        countActiveUsersByTimeInterval(
          // (30 days ago 23:59:59.999, target day 23:59:59.999]
          lastTimestampOfDay(targetDay.subtract(30, 'day')),
          lastTimestampOfDay(targetDay)
        ),
      ]);

      const previousDate = getDateString(targetDay.subtract(1, 'day'));
      const targetDate = getDateString(targetDay);

      const previousDAU = last30DauCounts.find(({ date }) => date === previousDate)?.count ?? 0;
      const dau = last30DauCounts.find(({ date }) => date === targetDate)?.count ?? 0;

      const dauCurve = indices(30).map((index) => {
        const dateString = getDateString(targetDay.subtract(29 - index, 'day'));
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
