import { interaction } from '@logto/schemas';

import { createLogTestContext, mockLog } from './log.test-utils.js';

const { jest } = import.meta;
const { logs, logRequest } = await createLogTestContext();
const { findLogsForExport, findLogById } = logs;

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET /logs/export', () => {
  const exportRow = {
    ...mockLog,
    createdAtCursor: '2026-11-11T04:40:45.123456Z',
  };
  const nextRow = {
    ...mockLog,
    id: '2',
    createdAtCursor: exportRow.createdAtCursor,
  };

  const toItem = ({ tenantId, id, key, payload, createdAt }: typeof exportRow) => ({
    tenantId,
    id,
    key,
    payload,
    createdAt,
  });

  const cursorOf = (row: typeof exportRow) =>
    Buffer.from(JSON.stringify({ createdAt: row.createdAtCursor, id: row.id }), 'utf8').toString(
      'base64url'
    );

  beforeEach(() => {
    findLogsForExport.mockReset();
    findLogsForExport.mockResolvedValue([]);
  });

  it('returns an empty page without nextCursor', async () => {
    const response = await logRequest.get('/logs/export?end_time=5000');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ items: [] });
    expect(findLogsForExport).toHaveBeenCalledWith(
      1001,
      expect.objectContaining({ after: undefined })
    );
  });

  it('does not fall through to GET /logs/:id', async () => {
    findLogsForExport.mockResolvedValueOnce([exportRow]);

    const response = await logRequest.get('/logs/export?end_time=5000&limit=1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      items: [toItem(exportRow)],
    });
    expect(findLogById).not.toHaveBeenCalled();
  });

  it('returns a page and a cursor when more rows exist', async () => {
    findLogsForExport.mockResolvedValueOnce([exportRow, nextRow]);

    const response = await logRequest.get('/logs/export?end_time=5000&limit=1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      items: [toItem(exportRow)],
      nextCursor: cursorOf(exportRow),
    });
    expect(findLogsForExport).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ after: undefined })
    );
  });

  it('passes the cursor back as the exact insertion point for the next page', async () => {
    findLogsForExport.mockResolvedValueOnce([exportRow, nextRow]).mockResolvedValueOnce([nextRow]);

    const first = await logRequest.get('/logs/export?end_time=5000&limit=1');
    const cursor = first.body.nextCursor as string;
    const second = await logRequest.get(
      `/logs/export?end_time=5000&limit=1&cursor=${encodeURIComponent(cursor)}`
    );

    expect(second.status).toEqual(200);
    expect(second.body).toEqual({
      items: [toItem(nextRow)],
    });
    expect(findLogsForExport).toHaveBeenNthCalledWith(
      2,
      2,
      expect.objectContaining({
        after: { createdAt: exportRow.createdAtCursor, id: exportRow.id },
      })
    );
  });

  it('ends without nextCursor when the page is exactly full', async () => {
    findLogsForExport.mockResolvedValueOnce([exportRow]);

    const response = await logRequest.get('/logs/export?end_time=5000&limit=1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      items: [toItem(exportRow)],
    });
  });

  it('uses yes() semantics for excludeWebhookLogs', async () => {
    await logRequest.get('/logs/export?end_time=5000');

    const firstCondition = findLogsForExport.mock.calls[0]?.[1] as {
      includeKeyPrefix?: unknown[];
    };
    expect(firstCondition.includeKeyPrefix).toBeUndefined();

    await logRequest.get('/logs/export?end_time=5000&excludeWebhookLogs=1');

    const secondCondition = findLogsForExport.mock.calls[1]?.[1] as {
      includeKeyPrefix?: unknown[];
    };
    expect(secondCondition.includeKeyPrefix).toContain(interaction.prefix);
  });

  it('accepts end_time=0 and start_time=0 as real bounds', async () => {
    const response = await logRequest.get('/logs/export?end_time=0&start_time=0');

    expect(response.status).toEqual(200);
    expect(findLogsForExport).toHaveBeenCalledWith(
      1001,
      expect.objectContaining({ startTime: 0, endTime: 0 })
    );
  });

  it('accepts the maximum limit and requests one extra row', async () => {
    const response = await logRequest.get('/logs/export?end_time=5000&limit=10000');

    expect(response.status).toEqual(200);
    expect(findLogsForExport).toHaveBeenCalledWith(
      10_001,
      expect.objectContaining({ after: undefined })
    );
  });

  it('returns 500 when the page query fails', async () => {
    findLogsForExport.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await logRequest.get('/logs/export?end_time=5000');

    expect(response.status).toEqual(500);
    expect(response.body).not.toHaveProperty('nextCursor');
  });

  it.each([
    ['missing end_time', '/logs/export'],
    ['future end_time', `/logs/export?end_time=${Date.now() + 3_600_000}`],
    ['inverted window', '/logs/export?end_time=5000&start_time=6000'],
    ['empty start_time', '/logs/export?end_time=5000&start_time='],
    ['negative end_time', '/logs/export?end_time=-1'],
    ['fractional end_time', '/logs/export?end_time=1.5'],
    ['empty cursor', '/logs/export?end_time=5000&cursor='],
    ['invalid cursor', '/logs/export?end_time=5000&cursor=not-a-cursor'],
    [
      'invalid cursor timestamp',
      `/logs/export?end_time=5000&cursor=${encodeURIComponent(
        Buffer.from(
          JSON.stringify({ createdAt: 'not-a-timestamp', id: 'log-id' }),
          'utf8'
        ).toString('base64url')
      )}`,
    ],
    ['zero limit', '/logs/export?end_time=5000&limit=0'],
    ['limit above the cap', '/logs/export?end_time=5000&limit=10001'],
    ['fractional limit', '/logs/export?end_time=5000&limit=1.5'],
    ['non-numeric limit', '/logs/export?end_time=5000&limit=abc'],
  ])('returns 400 for %s', async (_name, path) => {
    const response = await logRequest.get(path);

    expect(response.status).toEqual(400);
    expect(findLogsForExport).not.toHaveBeenCalled();
  });
});
