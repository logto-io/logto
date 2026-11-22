import { createLogTestContext, mockLog } from './log.test-utils.js';

const { jest } = import.meta;
const { logs, logRequest } = await createLogTestContext();
const { findLogById } = logs;

afterEach(() => {
  jest.clearAllMocks();
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
