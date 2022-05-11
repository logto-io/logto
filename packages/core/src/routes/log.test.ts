import { LogCondition } from '@/queries/log';
import logRoutes from '@/routes/log';
import { createRequester } from '@/utils/test-utils';

const mockLogs = [{ id: 1 }, { id: 2 }];

/* eslint-disable @typescript-eslint/no-unused-vars */
const countLogs = jest.fn(async (condition: LogCondition) => ({
  count: mockLogs.length,
}));
const findLogs = jest.fn(
  async (limit: number, offset: number, condition: LogCondition) => mockLogs
);
/* eslint-enable @typescript-eslint/no-unused-vars */

jest.mock('@/queries/log', () => ({
  countLogs: async (condition: LogCondition) => countLogs(condition),
  findLogs: async (limit: number, offset: number, condition: LogCondition) =>
    findLogs(limit, offset, condition),
}));

describe('logRoutes', () => {
  const userRequest = createRequester({ authedRoutes: logRoutes });

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

      await userRequest.get(
        `/logs?userId=${userId}&applicationId=${applicationId}&logType=${logType}&page=${page}&page_size=${pageSize}`
      );
      expect(countLogs).toHaveBeenCalledWith({ userId, applicationId, logType });
      expect(findLogs).toHaveBeenCalledWith(5, 0, { userId, applicationId, logType });
    });

    it('should return correct response', async () => {
      const response = await userRequest.get(`/logs`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLogs);
      expect(response.header).toHaveProperty('total-number', `${mockLogs.length}`);
    });
  });
});
