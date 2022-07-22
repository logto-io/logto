import { authedAdminApi } from '@/api';
import { registerUserAndSignIn } from '@/helper';

describe('admin console dashboard', () => {
  it('should get total user count successfully', async () => {
    await registerUserAndSignIn();

    const { totalUserCount } = await authedAdminApi
      .get('dashboard/users/total')
      .json<{ totalUserCount: number }>();

    expect(totalUserCount).toBeGreaterThan(0);
  });

  it('should get new user statistics successfully', async () => {
    type NewUserStatistics = {
      today: {
        count: number;
        delta: number;
      };
      last7Days: {
        count: number;
        delta: number;
      };
    };

    await registerUserAndSignIn();

    const newUserStatistics = await authedAdminApi
      .get('dashboard/users/new')
      .json<NewUserStatistics>();

    expect(newUserStatistics.today.count).toBeGreaterThan(0);
    expect(newUserStatistics.today.delta).toBeGreaterThan(0);

    expect(newUserStatistics.last7Days.count).toBeGreaterThan(0);
    expect(newUserStatistics.last7Days.delta).toBeGreaterThan(0);
  });

  it('should get active user statistics successfully', async () => {
    type ActiveUserStatistics = {
      dauCurve: Array<{
        date: string;
        count: number;
      }>;
      dau: {
        count: number;
        delta: number;
      };
      wau: {
        count: number;
        delta: number;
      };
      mau: {
        count: number;
        delta: number;
      };
    };

    await registerUserAndSignIn();

    const activeUserStatistics = await authedAdminApi
      .get('dashboard/users/active')
      .json<ActiveUserStatistics>();

    expect(activeUserStatistics.dauCurve.length).toBeGreaterThan(0);
    expect(activeUserStatistics.dau.count).toBeGreaterThan(0);
    expect(activeUserStatistics.dau.delta).toBeGreaterThan(0);
    expect(activeUserStatistics.wau.count).toBeGreaterThan(0);
    expect(activeUserStatistics.wau.delta).toBeGreaterThan(0);
    expect(activeUserStatistics.mau.count).toBeGreaterThan(0);
    expect(activeUserStatistics.mau.delta).toBeGreaterThan(0);
  });
});
