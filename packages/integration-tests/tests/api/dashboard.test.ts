import { SignUpIdentifier } from '@logto/schemas';

import type { StatisticsData } from '@/api';
import { getTotalUsersCount, getNewUsersData, getActiveUsersData } from '@/api';
import { createUserByAdmin, registerNewUser, setSignUpIdentifier, signIn } from '@/helpers';
import { generateUsername, generatePassword } from '@/utils';

describe('admin console dashboard', () => {
  beforeAll(async () => {
    await setSignUpIdentifier(SignUpIdentifier.Username);
  });

  it('should get total user count successfully', async () => {
    const { totalUserCount: originTotalUserCount } = await getTotalUsersCount();

    const password = generatePassword();
    const username = generateUsername();
    await createUserByAdmin(username, password);

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
    await createUserByAdmin(username, password);

    await signIn(username, password);

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
