// The FP version works better for `format()`
/* eslint-disable import/no-duplicates */
import { pickDefault } from '@logto/shared/esm';
import { subDays } from 'date-fns';
import { format } from 'date-fns/fp';

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';
import { getUtcEndOfTheDay } from '#src/utils/utc.js';
/* eslint-enable import/no-duplicates */

const { jest } = import.meta;

const totalUserCount = 1000;
const formatToQueryDate = format('yyyy-MM-dd');

const mockDailyNewUserCounts = [
  { date: '2022-05-01', count: 1 },
  { date: '2022-05-02', count: 2 },
  { date: '2022-05-03', count: 3 },
  { date: '2022-05-06', count: 6 },
  { date: '2022-05-07', count: 7 },
  { date: '2022-05-08', count: 8 },
  { date: '2022-05-09', count: 9 },
  { date: '2022-05-10', count: 10 },
  { date: '2022-05-13', count: 13 },
  { date: '2022-05-14', count: 14 },
];

const mockDailyActiveUserCounts = [
  { date: '2022-05-01', count: 501 },
  { date: '2022-05-23', count: 523 },
  { date: '2022-05-29', count: 529 },
  { date: '2022-05-30', count: 530 },
];

const mockActiveUserCount = 1000;

const users = {
  countUsers: jest.fn(async () => ({ count: totalUserCount })),
  getDailyNewUserCountsByTimeInterval: jest.fn(async () => mockDailyNewUserCounts),
};
const { countUsers, getDailyNewUserCountsByTimeInterval } = users;

const dailyActiveUsers = {
  getDailyActiveUserCountsByTimeInterval: jest.fn().mockResolvedValue(mockDailyActiveUserCounts),
  countActiveUsersByTimeInterval: jest.fn().mockResolvedValue({ count: mockActiveUserCount }),
};
const { getDailyActiveUserCountsByTimeInterval, countActiveUsersByTimeInterval } = dailyActiveUsers;

const tenantContext = new MockTenant(undefined, { dailyActiveUsers, users });
const dashboardRoutes = await pickDefault(import('./dashboard.js'));

describe('dashboardRoutes', () => {
  const logRequest = createRequester({ authedRoutes: dashboardRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /dashboard/users/total', () => {
    it('should call countUsers with no parameters', async () => {
      await logRequest.get('/dashboard/users/total');
      expect(countUsers).toHaveBeenCalledWith({});
    });

    it('/dashboard/users/total should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/total');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ totalUserCount });
    });
  });

  describe('GET /dashboard/users/new', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(Date.UTC(2022, 4, 14));
    });

    it('should call getDailyNewUserCountsByTimeInterval with the time interval (14 days ago 23:59:59.999, today 23:59:59.999]', async () => {
      await logRequest.get('/dashboard/users/new');
      expect(getDailyNewUserCountsByTimeInterval).toHaveBeenCalledWith(
        getUtcEndOfTheDay(subDays(Date.now(), 14)),
        getUtcEndOfTheDay(Date.now())
      );
    });

    it('should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/new');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        today: {
          count: 14,
          delta: 1,
        },
        last7Days: {
          count: 54,
          delta: 35,
        },
      });
    });
  });

  describe('GET /dashboard/users/active', () => {
    const mockToday = Date.UTC(2022, 4, 30);

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(mockToday);
    });

    it('should fail when the parameter `date` does not match the date regex', async () => {
      const response = await logRequest.get('/dashboard/users/active?date=2022.5.1');
      expect(response.status).toEqual(400);
    });

    it('should call getDailyActiveUserCountsByTimeInterval with the time interval (2022-05-31, 2022-06-30] when the parameter `date` is 2022-06-30', async () => {
      const targetDate = Date.UTC(2022, 5, 30);
      await logRequest.get(`/dashboard/users/active?date=${formatToQueryDate(targetDate)}`);
      expect(getDailyActiveUserCountsByTimeInterval).toHaveBeenCalledWith(
        getUtcEndOfTheDay(Date.UTC(2022, 4, 31)),
        getUtcEndOfTheDay(targetDate)
      );
    });

    it('should call getDailyActiveUserCountsByTimeInterval with the time interval (30 days ago, tomorrow] when there is no parameter `date`', async () => {
      await logRequest.get('/dashboard/users/active');
      expect(getDailyActiveUserCountsByTimeInterval).toHaveBeenCalledWith(
        getUtcEndOfTheDay(Date.UTC(2022, 3, 30)),
        getUtcEndOfTheDay(mockToday)
      );
    });

    it('should call countActiveUsersByTimeInterval with correct parameters when the parameter `date` is 2022-06-30', async () => {
      const targetDate = Date.UTC(2022, 5, 30);
      await logRequest.get(`/dashboard/users/active?date=${formatToQueryDate(targetDate)}`);
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        1,
        getUtcEndOfTheDay(Date.UTC(2022, 5, 16)),
        getUtcEndOfTheDay(Date.UTC(2022, 5, 23))
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        2,
        getUtcEndOfTheDay(Date.UTC(2022, 5, 23)),
        getUtcEndOfTheDay(targetDate)
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        3,
        getUtcEndOfTheDay(Date.UTC(2022, 4, 1)),
        getUtcEndOfTheDay(Date.UTC(2022, 4, 31))
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        4,
        getUtcEndOfTheDay(Date.UTC(2022, 4, 31)),
        getUtcEndOfTheDay(targetDate)
      );
    });

    it('should call countActiveUsersByTimeInterval with correct parameters when there is no parameter `date`', async () => {
      await logRequest.get('/dashboard/users/active');
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        1,
        getUtcEndOfTheDay(Date.UTC(2022, 4, 16)),
        getUtcEndOfTheDay(Date.UTC(2022, 4, 23))
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        2,
        getUtcEndOfTheDay(Date.UTC(2022, 4, 23)),
        getUtcEndOfTheDay(mockToday)
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        3,
        getUtcEndOfTheDay(Date.UTC(2022, 2, 31)),
        getUtcEndOfTheDay(Date.UTC(2022, 3, 30))
      );
      expect(countActiveUsersByTimeInterval).toHaveBeenNthCalledWith(
        4,
        getUtcEndOfTheDay(Date.UTC(2022, 3, 30)),
        getUtcEndOfTheDay(mockToday)
      );
    });

    it('should return correct response', async () => {
      const response = await logRequest.get('/dashboard/users/active');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        dauCurve: [
          { date: '2022-05-01', count: 501 },
          { date: '2022-05-02', count: 0 },
          { date: '2022-05-03', count: 0 },
          { date: '2022-05-04', count: 0 },
          { date: '2022-05-05', count: 0 },
          { date: '2022-05-06', count: 0 },
          { date: '2022-05-07', count: 0 },
          { date: '2022-05-08', count: 0 },
          { date: '2022-05-09', count: 0 },
          { date: '2022-05-10', count: 0 },
          { date: '2022-05-11', count: 0 },
          { date: '2022-05-12', count: 0 },
          { date: '2022-05-13', count: 0 },
          { date: '2022-05-14', count: 0 },
          { date: '2022-05-15', count: 0 },
          { date: '2022-05-16', count: 0 },
          { date: '2022-05-17', count: 0 },
          { date: '2022-05-18', count: 0 },
          { date: '2022-05-19', count: 0 },
          { date: '2022-05-20', count: 0 },
          { date: '2022-05-21', count: 0 },
          { date: '2022-05-22', count: 0 },
          { date: '2022-05-23', count: 523 },
          { date: '2022-05-24', count: 0 },
          { date: '2022-05-25', count: 0 },
          { date: '2022-05-26', count: 0 },
          { date: '2022-05-27', count: 0 },
          { date: '2022-05-28', count: 0 },
          { date: '2022-05-29', count: 529 },
          { date: '2022-05-30', count: 530 },
        ],
        dau: { count: 530, delta: 1 },
        wau: { count: 1000, delta: 0 },
        mau: { count: 1000, delta: 0 },
      });
    });
  });
});
