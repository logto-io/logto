import type { LogCondition } from '@/queries/log';
import logRoutes from '@/routes/log';
import { createRequester } from '@/utils/test-utils';

const mockBody = { type: 'a', payload: {}, createdAt: 123 };
const mockLog = { id: '1', ...mockBody };
const mockLogs = [mockLog, { id: '2', ...mockBody }];

const countLogs = jest.fn(async (condition: LogCondition) => ({
  count: mockLogs.length,
}));
const findLogs = jest.fn(
  async (limit: number, offset: number, condition: LogCondition) => mockLogs
);
const findLogById = jest.fn(async (id: string) => mockLog);

jest.mock('@/queries/log', () => ({
  countLogs: async (condition: LogCondition) => countLogs(condition),
  findLogs: async (limit: number, offset: number, condition: LogCondition) =>
    findLogs(limit, offset, condition),
  findLogById: async (id: string) => findLogById(id),
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

  describe('GET /logs/:id', () => {
    const logId = 'logIdValue';

    it('should call findLogById with correct parameters', async () => {
      await logRequest.get(`/logs/${logId}`);
      expect(findLogById).toHaveBeenCalledWith(logId);
    });

    it('should return correct response', async () => {
      const response = await logRequest.get(`/logs/${logId}`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLog);
    });
  });
});
