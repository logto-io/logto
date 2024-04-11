import { SignInIdentifier } from '@logto/schemas';

import type { StatisticsData } from '#src/api/index.js';
import { api, getTotalUsersCount, getNewUsersData, getActiveUsersData } from '#src/api/index.js';
import { createUserByAdmin, expectRejects } from '#src/helpers/index.js';
import { registerNewUser, signInWithPassword } from '#src/helpers/interactions.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword } from '#src/utils.js';

describe('admin console dashboard', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  it('non authorized request should return 401', async () => {
    await expectRejects(api.get('dashboard/users/total'), {
      code: 'auth.authorization_header_missing',
      status: 401,
    });
    await expectRejects(api.get('dashboard/users/new'), {
      code: 'auth.authorization_header_missing',
      status: 401,
    });
    await expectRejects(api.get('dashboard/users/active'), {
      code: 'auth.authorization_header_missing',
      status: 401,
    });
  });

  it('should get total user count successfully', async () => {
    const { totalUserCount: originTotalUserCount } = await getTotalUsersCount();

    const password = generatePassword();
    const username = generateUsername();
    await createUserByAdmin({ username, password });

    const { totalUserCount } = await getTotalUsersCount();

    expect(totalUserCount).toBe(originTotalUserCount + 1);
  });

  it('should get new user statistics successfully', async () => {
    const originUserStatistics = await getNewUsersData();

    await registerNewUser(generateUsername(), generatePassword());

    const newUserStatistics = await getNewUsersData();

    const keyToCompare: Array<keyof StatisticsData> = ['count', 'delta'];

    for (const key of keyToCompare) {
      expect(newUserStatistics.today[key]).toBe(originUserStatistics.today[key] + 1);
      expect(newUserStatistics.last7Days[key]).toBe(originUserStatistics.last7Days[key] + 1);
    }
  });

  it('should get active user statistics successfully', async () => {
    const originActiveUserStatistics = await getActiveUsersData();

    const password = generatePassword();
    const username = generateUsername();
    await createUserByAdmin({ username, password });

    await signInWithPassword({ username, password });

    const newActiveUserStatistics = await getActiveUsersData();

    expect(newActiveUserStatistics.dauCurve.length).toBeGreaterThan(0);

    const keyToCompare: Array<keyof StatisticsData> = ['count', 'delta'];

    for (const key of keyToCompare) {
      expect(newActiveUserStatistics.dau[key]).toBe(originActiveUserStatistics.dau[key] + 1);
      expect(newActiveUserStatistics.wau[key]).toBe(originActiveUserStatistics.wau[key] + 1);
      expect(newActiveUserStatistics.mau[key]).toBe(originActiveUserStatistics.mau[key] + 1);
    }
  });
});
