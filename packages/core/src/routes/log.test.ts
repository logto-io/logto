import { LogCondition } from '@/queries/log';
import logRoutes from '@/routes/log';
import { createRequester } from '@/utils/test-utils';

const mockLogs = [{ id: 1 }, { id: 2 }];

const mockDnuCounts = [
  { date: '2022-05-01', count: 5 },
  { date: '2022-05-02', count: 10 },
];

/* eslint-disable @typescript-eslint/no-unused-vars */
const countLogs = jest.fn(async (condition: LogCondition) => ({
  count: mockLogs.length,
}));
const findLogs = jest.fn(
  async (limit: number, offset: number, condition: LogCondition) => mockLogs
);
const getDnuCountsByTimeInterval = jest.fn(
  async (startTimeInclusive: number, endTimeExclusive: number) => mockDnuCounts
);
/* eslint-enable @typescript-eslint/no-unused-vars */

jest.mock('@/queries/log', () => ({
  countLogs: async (condition: LogCondition) => countLogs(condition),
  findLogs: async (limit: number, offset: number, condition: LogCondition) =>
    findLogs(limit, offset, condition),
  getDnuCountsByTimeInterval: async (startTimeInclusive: number, endTimeExclusive: number) =>
    getDnuCountsByTimeInterval(startTimeInclusive, endTimeExclusive),
}));

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
    it('should fail when start date is earlier than end date', async () => {
      const start = '2022-05-01';
      const end = '2022-04-30';
      const response = await logRequest.get(`/dashboard?start=${start}&end=${end}`);
      expect(response.status).toEqual(400);
    });

    it('should call getDnuCountsByTimeInterval with correct parameters', async () => {
      const start = '2022-05-01';
      const end = '2022-05-02';
      await logRequest.get(`/dashboard?start=${start}&end=${end}`);
      expect(getDnuCountsByTimeInterval).toHaveBeenCalledWith(1_651_363_200_000, 1_651_536_000_000);
    });

    it('should return correct response', async () => {
      const start = '2022-05-01';
      const end = '2022-05-02';
      const response = await logRequest.get(`/dashboard?start=${start}&end=${end}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ dnuCounts: mockDnuCounts, dauCounts: {} });
    });
  });
});
