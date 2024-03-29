import { getLog, getAuditLogs } from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

describe('logs', () => {
  it('should get logs successfully', async () => {
    const logs = await getAuditLogs();

    expect(logs.length).toBeGreaterThan(0);
  });

  it('should get log detail successfully', async () => {
    const logs = await getAuditLogs();
    const logId = logs[0]?.id;

    expect(logId).not.toBeUndefined();

    if (logId) {
      await expect(getLog(logId)).resolves.toHaveProperty('id', logId);
    }
  });

  it('should throw on getting non-exist log detail', async () => {
    await expectRejects(getLog('non-exist-log-id'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });
});
