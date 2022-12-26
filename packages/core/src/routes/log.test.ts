import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockBody = { key: 'a', payload: {}, createdAt: 123 };
const mockLog = { id: '1', ...mockBody };
const mockLogs = [mockLog, { id: '2', ...mockBody }];

const { countLogs, findLogs, findLogById } = mockEsm('#src/queries/log.js', () => ({
  countLogs: jest.fn().mockResolvedValue({
    count: mockLogs.length,
  }),
  findLogs: jest.fn().mockResolvedValue(mockLogs),
  findLogById: jest.fn().mockResolvedValue(mockLog),
}));
const logRoutes = await pickDefault(import('./log.js'));

describe('logRoutes', () => {
  const logRequest = createRequester({ authedRoutes: logRoutes });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /logs', () => {
    it('should call countLogs and findLogs with correct parameters', async () => {
      const userId = 'userIdValue';
      const applicationId = 'foo';
      const logKey = 'SignInUsernamePassword';
      const page = 1;
      const pageSize = 5;

      await logRequest.get(
        `/logs?userId=${userId}&applicationId=${applicationId}&logKey=${logKey}&page=${page}&page_size=${pageSize}`
      );
      expect(countLogs).toHaveBeenCalledWith({ userId, applicationId, logKey });
      expect(findLogs).toHaveBeenCalledWith(5, 0, { userId, applicationId, logKey });
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
