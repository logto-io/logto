import dayjs, { Dayjs } from 'dayjs';

import { getDailyNewUserCountsByTimeInterval } from '@/queries/log';
import { countUsers } from '@/queries/user';

import { AuthedRouter } from './types';

const getDateString = (day: Dayjs) => day.format('YYYY-MM-DD');

export default function dashboardRoutes<T extends AuthedRouter>(router: T) {
  router.get('/dashboard/users/total', async (ctx, next) => {
    const { count: totalUserCount } = await countUsers();
    ctx.body = { totalUserCount };

    return next();
  });

  router.get('/dashboard/users/new', async (ctx, next) => {
    const today = dayjs();

    const thirteenDaysAgo = today.subtract(13, 'day');
    const tomorrow = today.add(1, 'day');
    const dailyNewUserCounts = await getDailyNewUserCountsByTimeInterval(
      thirteenDaysAgo.valueOf(),
      tomorrow.valueOf()
    );

    const recent14DaysDailyNewUserCounts = new Map(
      dailyNewUserCounts.map(({ date, count }) => [date, count])
    );

    const todayNewUserCount = recent14DaysDailyNewUserCounts.get(getDateString(today)) ?? 0;
    const yesterday = today.subtract(1, 'day');
    const yesterdayNewUserCount = recent14DaysDailyNewUserCounts.get(getDateString(yesterday)) ?? 0;
    // If yesterdayNewUserCount is 0, todayUpPercent will be not applicable.
    const todayUpPercent =
      yesterdayNewUserCount > 0
        ? Math.round((todayNewUserCount / yesterdayNewUserCount) * 100 - 100)
        : undefined;

    const recent7DaysNewUserCount = [...Array.from({ length: 7 }).keys()]
      .map((index) => getDateString(today.subtract(index, 'day')))
      .reduce((sum, date) => sum + (recent14DaysDailyNewUserCounts.get(date) ?? 0), 0);
    const newUserCountFrom13DaysAgoTo7DaysAgo = [...Array.from({ length: 7 }).keys()]
      .map((index) => getDateString(today.subtract(7 + index, 'day')))
      .reduce((sum, date) => sum + (recent14DaysDailyNewUserCounts.get(date) ?? 0), 0);
    // If newUserCountFrom13DaysAgoTo7DaysAgo is 0, past7DaysUpPercent will be not applicable.
    const past7DaysUpPercent =
      newUserCountFrom13DaysAgoTo7DaysAgo > 0
        ? Math.round((recent7DaysNewUserCount / newUserCountFrom13DaysAgoTo7DaysAgo) * 100 - 100)
        : undefined;

    ctx.body = {
      today: {
        count: todayNewUserCount,
        upPercent: todayUpPercent,
      },
      past7Days: {
        count: recent7DaysNewUserCount,
        upPercent: past7DaysUpPercent,
      },
    };

    return next();
  });
}
