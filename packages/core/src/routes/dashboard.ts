import { dateRegex } from '@logto/shared';
import dayjs, { Dayjs } from 'dayjs';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import {
  getActiveUserCountByTimeInterval,
  getDailyActiveUserCountsByTimeInterval,
  getDailyNewUserCountsByTimeInterval,
} from '@/queries/log';
import { countUsers } from '@/queries/user';

import { AuthedRouter } from './types';

const getDateString = (day: Dayjs) => day.format('YYYY-MM-DD');

const indicesFrom0To6 = [...Array.from({ length: 7 }).keys()];

export default function dashboardRoutes<T extends AuthedRouter>(router: T) {
  router.get('/dashboard/users/total', async (ctx, next) => {
    const { count: totalUserCount } = await countUsers();
    ctx.body = { totalUserCount };

    return next();
  });

  router.get('/dashboard/users/new', async (ctx, next) => {
    const today = dayjs();
    const fourteenDaysAgo = today.subtract(14, 'day');
    const dailyNewUserCounts = await getDailyNewUserCountsByTimeInterval(
      // Time interval: (14 days ago 23:59:59.999, today 23:59:59.999]
      fourteenDaysAgo.endOf('day').valueOf(),
      today.endOf('day').valueOf()
    );

    const last14DaysNewUserCounts = new Map(
      dailyNewUserCounts.map(({ date, count }) => [date, count])
    );

    const todayNewUserCount = last14DaysNewUserCounts.get(getDateString(today)) ?? 0;
    const yesterday = today.subtract(1, 'day');
    const yesterdayNewUserCount = last14DaysNewUserCounts.get(getDateString(yesterday)) ?? 0;
    const todayDelta = todayNewUserCount - yesterdayNewUserCount;

    const last7DaysNewUserCount = indicesFrom0To6
      .map((index) => getDateString(today.subtract(index, 'day')))
      .reduce((sum, date) => sum + (last14DaysNewUserCounts.get(date) ?? 0), 0);
    const newUserCountFrom13DaysAgoTo7DaysAgo = indicesFrom0To6
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

      // DAU: Daily Active User
      const thirtyDaysAgo = targetDay.subtract(30, 'day');
      const dauCounts = await getDailyActiveUserCountsByTimeInterval(
        // Time interval: (30 days ago 23:59:59.999, target day 23:59:59.999]
        thirtyDaysAgo.endOf('day').valueOf(),
        targetDay.endOf('day').valueOf()
      );
      const recent30DauCounts = new Map(dauCounts.map(({ date, count }) => [date, count]));

      const targetDAU = recent30DauCounts.get(getDateString(targetDay)) ?? 0;
      const previousDay = targetDay.subtract(1, 'day');
      const previousDAU = recent30DauCounts.get(getDateString(previousDay)) ?? 0;
      const dauDelta = targetDAU - previousDAU;

      // WAU: Weekly Active User
      const sevenDaysAgo = targetDay.subtract(7, 'day');
      const { count: wauFrom6DaysAgoToTargetDay } = await getActiveUserCountByTimeInterval(
        // (7 days ago 23:59:59.999, target day 23:59:59.999]
        sevenDaysAgo.endOf('day').valueOf(),
        targetDay.endOf('day').valueOf()
      );
      const fourteenDaysAgo = targetDay.subtract(14, 'day');
      const { count: wauFrom13DaysAgoTo7DaysAgo } = await getActiveUserCountByTimeInterval(
        // (14 days ago 23:59:59.999, 7 days ago 23:59:59.999]
        fourteenDaysAgo.endOf('day').valueOf(),
        sevenDaysAgo.endOf('day').valueOf()
      );
      const wauDelta = wauFrom6DaysAgoToTargetDay - wauFrom13DaysAgoTo7DaysAgo;

      // MAU: Monthly Active User
      const { count: mauFrom29DaysAgoToTargetDay } = await getActiveUserCountByTimeInterval(
        // (30 days ago 23:59:59.999, target day 23:59:59.999]
        thirtyDaysAgo.endOf('day').valueOf(),
        targetDay.endOf('day').valueOf()
      );
      const sixtyDaysAgo = targetDay.subtract(60, 'day');
      const { count: mauFrom59DaysAgoTo30DaysAgo } = await getActiveUserCountByTimeInterval(
        // (60 days ago 23:59:59.999, 30 days ago 23:59:59.999]
        sixtyDaysAgo.endOf('day').valueOf(),
        thirtyDaysAgo.endOf('day').valueOf()
      );
      const mauDelta = mauFrom29DaysAgoToTargetDay - mauFrom59DaysAgoTo30DaysAgo;

      ctx.body = {
        dauCurve: dauCounts,
        dau: {
          count: targetDAU,
          delta: dauDelta,
        },
        wau: {
          count: wauFrom6DaysAgoToTargetDay,
          delta: wauDelta,
        },
        mau: {
          count: mauFrom29DaysAgoToTargetDay,
          delta: mauDelta,
        },
      };

      return next();
    }
  );
}
