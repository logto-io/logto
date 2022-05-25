import dayjs, { Dayjs } from 'dayjs';

import { getDailyNewUserCountsByTimeInterval } from '@/queries/log';
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
}
