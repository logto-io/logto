import { getLog, getLogs } from '#src/api/index.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';

describe('logs', () => {
  it('should get logs successfully', async () => {
    const logs = await getLogs();

    expect(logs.length).toBeGreaterThan(0);
  });

  it('should get log detail successfully', async () => {
    const logs = await getLogs();
    const logId = logs[0]?.id;

    expect(logId).not.toBeUndefined();

    if (logId) {
      await expect(getLog(logId)).resolves.toHaveProperty('id', logId);
    }
  });

  it('should throw on getting non-exist log detail', async () => {
    await expect(getLog('non-exist-log-id')).rejects.toMatchObject(createResponseWithCode(404));
  });
});
