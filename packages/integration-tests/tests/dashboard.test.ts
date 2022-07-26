import { authedAdminApi } from '@/api';
import { registerUserAndSignIn } from '@/helper';

type StatisticsData = {
  count: number;
  delta: number;
};

describe('admin console dashboard', () => {
  it('should get total user count successfully', async () => {
    type TotalUserCountData = {
      totalUserCount: number;
    };

    const { totalUserCount: originTotalUserCount } = await authedAdminApi
      .get('dashboard/users/total')
      .json<TotalUserCountData>();

    await registerUserAndSignIn();

    const { totalUserCount } = await authedAdminApi
      .get('dashboard/users/total')
      .json<TotalUserCountData>();

    expect(totalUserCount).toBe(originTotalUserCount + 1);
  });

  it('should get new user statistics successfully', async () => {
    type NewUserStatistics = {
      today: StatisticsData;
      last7Days: StatisticsData;
    };

    const originUserStatistics = await authedAdminApi
      .get('dashboard/users/new')
      .json<NewUserStatistics>();

    await registerUserAndSignIn();

    const newUserStatistics = await authedAdminApi
      .get('dashboard/users/new')
      .json<NewUserStatistics>();

    const keyToCompare: Array<keyof StatisticsData> = ['count', 'delta'];

    for (const key of keyToCompare) {
      expect(newUserStatistics.today[key]).toBe(originUserStatistics.today[key] + 1);
      expect(newUserStatistics.last7Days[key]).toBe(originUserStatistics.last7Days[key] + 1);
    }
  });

  it('should get active user statistics successfully', async () => {
    type ActiveUserStatistics = {
      dauCurve: StatisticsData[];
      dau: StatisticsData;
      wau: StatisticsData;
      mau: StatisticsData;
    };

    const originActiveUserStatistics = await authedAdminApi
      .get('dashboard/users/active')
      .json<ActiveUserStatistics>();

    await registerUserAndSignIn();

    const activeUserStatistics = await authedAdminApi
      .get('dashboard/users/active')
      .json<ActiveUserStatistics>();

    expect(activeUserStatistics.dauCurve.length).toBeGreaterThan(0);

    const keyToCompare: Array<keyof StatisticsData> = ['count', 'delta'];

    for (const key of keyToCompare) {
      expect(activeUserStatistics.dau[key]).toBe(originActiveUserStatistics.dau[key] + 1);
      expect(activeUserStatistics.wau[key]).toBe(originActiveUserStatistics.wau[key] + 1);
      expect(activeUserStatistics.mau[key]).toBe(originActiveUserStatistics.mau[key] + 1);
    }
  });
});
