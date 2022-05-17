import dayjs from 'dayjs';

import { LogCondition } from '@/queries/log';
import logRoutes, { getDateString } from '@/routes/log';
import { createRequester } from '@/utils/test-utils';

const mockLogs = [{ id: 1 }, { id: 2 }];

const mockDailyNewUserCounts = [
  { date: getDateString(dayjs().subtract(13, 'day')), count: 1 },
  { date: getDateString(dayjs().subtract(12, 'day')), count: 2 },
  { date: getDateString(dayjs().subtract(11, 'day')), count: 3 },
  { date: getDateString(dayjs().subtract(9, 'day')), count: 5 },
  { date: getDateString(dayjs().subtract(8, 'day')), count: 6 },
  { date: getDateString(dayjs().subtract(7, 'day')), count: 7 },
  { date: getDateString(dayjs().subtract(6, 'day')), count: 8 },
  { date: getDateString(dayjs().subtract(5, 'day')), count: 9 },
  { date: getDateString(dayjs().subtract(4, 'day')), count: 10 },
  { date: getDateString(dayjs().subtract(3, 'day')), count: 11 },
  { date: getDateString(dayjs().subtract(1, 'day')), count: 13 },
  { date: getDateString(dayjs().subtract(0, 'day')), count: 14 },
];

/* eslint-disable @typescript-eslint/no-unused-vars */
const countLogs = jest.fn(async (condition: LogCondition) => ({
  count: mockLogs.length,
}));
const findLogs = jest.fn(
  async (limit: number, offset: number, condition: LogCondition) => mockLogs
);
const getDailyNewUserCountsByTimeInterval = jest.fn(
  async (startTimeInclusive: number, endTimeExclusive: number) => mockDailyNewUserCounts
);
/* eslint-enable @typescript-eslint/no-unused-vars */

jest.mock('@/queries/log', () => ({
  countLogs: async (condition: LogCondition) => countLogs(condition),
  findLogs: async (limit: number, offset: number, condition: LogCondition) =>
    findLogs(limit, offset, condition),
  getDailyNewUserCountsByTimeInterval: async (
    startTimeInclusive: number,
    endTimeExclusive: number
  ) => getDailyNewUserCountsByTimeInterval(startTimeInclusive, endTimeExclusive),
}));

const mockTotalUserCount = 100;
const countUsers = jest.fn(async () => mockTotalUserCount);

jest.mock('@/queries/user', () => ({
  countUsers: async () => countUsers(),
}));

dayjs as jest.MockedFunction<typeof dayjs>;

describe('logRoutes', () => {
  const logRequest = createRequester({ authedRoutes: logRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /logs', () => {
    it('should call countLogs and findLogs with correct parameters', async () => {
      const userId = 'userIdValue';
      const applicationId = 'foo';
      const logType = 'SignInUsernamePassword';
      const page = 1;
      const pageSize = 5;

      await logRequest.get(
        `/logs?userId=${userId}&applicationId=${applicationId}&logType=${logType}&page=${page}&page_size=${pageSize}`
      );
      expect(countLogs).toHaveBeenCalledWith({ userId, applicationId, logType });
      expect(findLogs).toHaveBeenCalledWith(5, 0, { userId, applicationId, logType });
    });

    it('should return correct response', async () => {
      const response = await logRequest.get(`/logs`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLogs);
      expect(response.header).toHaveProperty('total-number', `${mockLogs.length}`);
    });
  });

  describe('GET /dashboard', () => {
    it('should call getDnuCountsByTimeInterval with correct parameters', async () => {
      await logRequest.get('/dashboard');
      expect(getDailyNewUserCountsByTimeInterval).toHaveBeenCalledWith(
        dayjs().subtract(14, 'day').valueOf(),
        dayjs().valueOf()
      );
    });

    it('should return correct response', async () => {
      const response = await logRequest.get('/dashboard');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        totalUserCount: mockTotalUserCount,
        userCount: {
          today: 14,
          yesterday: 13,
          thisWeek: 65,
          lastWeek: 24,
        },
        dailyActiveUserCounts: [],
      });
    });
  });
});
