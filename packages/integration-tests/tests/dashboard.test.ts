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

    expect(totalUserCount).toBeGreaterThan(originTotalUserCount);
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
      expect(newUserStatistics.today[key]).toBeGreaterThan(originUserStatistics.today[key]);
      expect(newUserStatistics.last7Days[key]).toBeGreaterThan(originUserStatistics.last7Days[key]);
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
      expect(activeUserStatistics.dau[key]).toBeGreaterThan(originActiveUserStatistics.dau[key]);
      expect(activeUserStatistics.wau[key]).toBeGreaterThan(originActiveUserStatistics.wau[key]);
      expect(activeUserStatistics.mau[key]).toBeGreaterThan(originActiveUserStatistics.mau[key]);
    }
  });
});
