import dayjs, { Dayjs } from 'dayjs';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { countLogs, findLogs, getDailyNewUserCountsByTimeInterval } from '@/queries/log';
import { countUsers } from '@/queries/user';

import { AuthedRouter } from './types';

export const getDateString = (day: Dayjs) => day.format('YYYY-MM-DD');

export default function logRoutes<T extends AuthedRouter>(router: T) {
  router.get(
    '/logs',
    koaPagination(),
    koaGuard({
      query: object({
        userId: string().optional(),
        applicationId: string().optional(),
        logType: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const {
        query: { userId, applicationId, logType },
      } = ctx.guard;

      const [{ count }, logs] = await Promise.all([
        countLogs({ logType, applicationId, userId }),
        findLogs(limit, offset, { logType, userId, applicationId }),
      ]);

      // Return totalCount to pagination middleware
      ctx.pagination.totalCount = count;
      ctx.body = logs;

      return next();
    }
  );

  router.get('/dashboard', async (ctx, next) => {
    const fourteenDaysAgo = dayjs().subtract(14, 'day');
    const today = dayjs();

    const [{ count: totalUserCount }, dailyNewUserCounts] = await Promise.all([
      await countUsers(),
      getDailyNewUserCountsByTimeInterval(fourteenDaysAgo.valueOf(), today.valueOf()),
    ]);

    const recent14DaysDailyNewUserCounts = new Map(
      dailyNewUserCounts.map(({ date, count }) => [date, count])
    );

    const todayNewUserCount = recent14DaysDailyNewUserCounts.get(getDateString(today)) ?? 0;
    const yesterdayNewUserCount =
      recent14DaysDailyNewUserCounts.get(getDateString(dayjs().subtract(1, 'day'))) ?? 0;

    const thisWeekNewUserCount = [...Array.from({ length: 7 }).keys()]
      .map((index) => getDateString(today.subtract(6 - index, 'day')))
      .reduce((sum, date) => sum + (recent14DaysDailyNewUserCounts.get(date) ?? 0), 0);
    const lastWeekNewUserCount = [...Array.from({ length: 7 }).keys()]
      .map((index) => getDateString(fourteenDaysAgo.add(1 + index, 'day')))
      .reduce((sum, date) => sum + (recent14DaysDailyNewUserCounts.get(date) ?? 0), 0);

    ctx.body = {
      totalUserCount,
      newUserCounts: {
        today: todayNewUserCount,
        yesterday: yesterdayNewUserCount,
        thisWeek: thisWeekNewUserCount,
        lastWeek: lastWeekNewUserCount,
      },
      dailyActiveUserCounts: [],
    };

    return next();
  });
}
