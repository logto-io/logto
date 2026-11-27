import { hook, interaction, LogResult } from '@logto/schemas';
import type { Log, LogResponse } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockBody = { key: 'a', payload: { key: 'a', result: LogResult.Success }, createdAt: 123 };
const mockLog: LogResponse = { tenantId: 'fake_tenant', id: '1', ...mockBody };

// Rows as the queries return them: the trigger-kept lookup columns must not reach the response.
const toRow = (log: LogResponse): Log => ({
  ...log,
  payloadUserId: 'user',
  payloadApplicationId: 'application',
  payloadHookId: 'hook',
});

const logs = {
  countLogs: jest.fn(),
  findLogs: jest.fn(),
  findLogsForCursor: jest.fn().mockResolvedValue([]),
  findLogById: jest.fn(),
  deleteLogsInRange: jest.fn(),
};
const { countLogs, findLogs, findLogsForCursor } = logs;
const logRoutes = await pickDefault(import('./log.js'));
const logRequest = createRequester({
  // The error handler and i18n middleware expose `RequestError` codes in the response body.
  middlewares: [koaI18next(), koaErrorHandler()],
  authedRoutes: logRoutes,
  tenantContext: new MockTenant(undefined, { logs }),
});

afterEach(() => {
  jest.clearAllMocks();
});

const getCursorPage = async (query: string) => logRequest.get(`/logs?pagination=cursor&${query}`);

describe('GET /logs cursor mode', () => {
  const cursorRow = {
    ...mockLog,
    createdAtCursor: '2026-11-11T04:40:45.123456Z',
  };
  const nextRow = {
    ...mockLog,
    id: '2',
    createdAtCursor: cursorRow.createdAtCursor,
  };

  const toItem = ({ tenantId, id, key, payload, createdAt }: typeof cursorRow) => ({
    tenantId,
    id,
    key,
    payload,
    createdAt,
  });

  const cursorOf = (row: typeof cursorRow) =>
    Buffer.from(JSON.stringify({ createdAt: row.createdAtCursor, id: row.id }), 'utf8').toString(
      'base64url'
    );

  beforeEach(() => {
    findLogsForCursor.mockReset();
    findLogsForCursor.mockResolvedValue([]);
  });

  it('returns an empty array without Next-Cursor', async () => {
    const response = await getCursorPage('end_time=5000');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
    expect(response.header).not.toHaveProperty('next-cursor');
    expect(response.header).not.toHaveProperty('total-number');
    expect(response.header).not.toHaveProperty('link');
    expect(findLogsForCursor).toHaveBeenCalledWith(
      501,
      expect.objectContaining({ after: undefined })
    );
    expect(countLogs).not.toHaveBeenCalled();
    expect(findLogs).not.toHaveBeenCalled();
  });

  it('returns a page and Next-Cursor when more rows exist', async () => {
    findLogsForCursor.mockResolvedValueOnce([cursorRow, nextRow]);

    const response = await getCursorPage('end_time=5000&limit=1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([toItem(cursorRow)]);
    expect(response.header).toHaveProperty('next-cursor', cursorOf(cursorRow));
    expect(findLogsForCursor).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ after: undefined })
    );
  });

  it('passes Next-Cursor back as the exact insertion point', async () => {
    findLogsForCursor.mockResolvedValueOnce([cursorRow, nextRow]).mockResolvedValueOnce([nextRow]);

    const first = await getCursorPage('end_time=5000&limit=1');
    const cursor = first.header['next-cursor']!;
    const second = await getCursorPage(
      `end_time=5000&limit=1&cursor=${encodeURIComponent(cursor)}`
    );

    expect(second.status).toEqual(200);
    expect(second.body).toEqual([toItem(nextRow)]);
    expect(second.header).not.toHaveProperty('next-cursor');
    expect(findLogsForCursor).toHaveBeenNthCalledWith(
      2,
      2,
      expect.objectContaining({
        after: { createdAt: cursorRow.createdAtCursor, id: cursorRow.id },
      })
    );
  });

  it('omits Next-Cursor when the page is exactly full', async () => {
    findLogsForCursor.mockResolvedValueOnce([cursorRow]);

    const response = await getCursorPage('end_time=5000&limit=1');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([toItem(cursorRow)]);
    expect(response.header).not.toHaveProperty('next-cursor');
  });

  it('queries audit logs only', async () => {
    await getCursorPage('end_time=5000');

    const [, condition] = findLogsForCursor.mock.calls[0] as [
      number,
      { includeKeyPrefix?: unknown[] },
    ];
    expect(condition.includeKeyPrefix).toContain(interaction.prefix);
    expect(condition.includeKeyPrefix).not.toContain(hook.Type.TriggerHook);
  });

  it('accepts end_time=0 and start_time=0 as real bounds', async () => {
    const response = await getCursorPage('end_time=0&start_time=0');

    expect(response.status).toEqual(200);
    expect(findLogsForCursor).toHaveBeenCalledWith(
      501,
      expect.objectContaining({ startTime: 0, endTime: 0 })
    );
  });

  it('accepts limit=1000 and requests one extra row', async () => {
    const response = await getCursorPage('end_time=5000&limit=1000');

    expect(response.status).toEqual(200);
    expect(findLogsForCursor).toHaveBeenCalledWith(
      1001,
      expect.objectContaining({ after: undefined })
    );
  });

  it('returns 500 when the page query fails', async () => {
    findLogsForCursor.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await getCursorPage('end_time=5000');

    expect(response.status).toEqual(500);
    expect(findLogsForCursor).toHaveBeenCalled();
  });

  it('returns a mode-specific error for an unsupported cursor-mode parameter', async () => {
    const response = await getCursorPage('page=1');

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({
      code: 'guard.unsupported_pagination_parameter',
      message: "Query parameter 'page' is not supported in cursor pagination mode.",
    });
    expect(findLogsForCursor).not.toHaveBeenCalled();
  });

  it('returns a mode-specific error for cursor parameters in page mode', async () => {
    const response = await logRequest.get('/logs?limit=1');

    expect(response.status).toEqual(400);
    expect(response.body).toMatchObject({
      code: 'guard.unsupported_pagination_parameter',
      message: "Query parameter 'limit' is not supported in page pagination mode.",
    });
    expect(countLogs).not.toHaveBeenCalled();
    expect(findLogs).not.toHaveBeenCalled();
  });

  it.each([
    ['missing end_time', '/logs?pagination=cursor'],
    ['future end_time', `/logs?pagination=cursor&end_time=${Date.now() + 3_600_000}`],
    ['inverted window', '/logs?pagination=cursor&end_time=5000&start_time=6000'],
    ['empty start_time', '/logs?pagination=cursor&end_time=5000&start_time='],
    ['negative end_time', '/logs?pagination=cursor&end_time=-1'],
    ['fractional end_time', '/logs?pagination=cursor&end_time=1.5'],
    ['empty cursor', '/logs?pagination=cursor&end_time=5000&cursor='],
    ['invalid cursor', '/logs?pagination=cursor&end_time=5000&cursor=not-a-cursor'],
    [
      'invalid cursor timestamp',
      `/logs?pagination=cursor&end_time=5000&cursor=${encodeURIComponent(
        Buffer.from(
          JSON.stringify({ createdAt: 'not-a-timestamp', id: 'log-id' }),
          'utf8'
        ).toString('base64url')
      )}`,
    ],
    ['zero limit', '/logs?pagination=cursor&end_time=5000&limit=0'],
    ['limit above the cap', '/logs?pagination=cursor&end_time=5000&limit=1001'],
    ['fractional limit', '/logs?pagination=cursor&end_time=5000&limit=1.5'],
    ['non-numeric limit', '/logs?pagination=cursor&end_time=5000&limit=abc'],
    ['page', '/logs?pagination=cursor&end_time=5000&page=1'],
    ['page_size', '/logs?pagination=cursor&end_time=5000&page_size=10'],
    ['empty page', '/logs?pagination=cursor&end_time=5000&page='],
    ['enableCap', '/logs?pagination=cursor&end_time=5000&enableCap=true'],
    ['userId', '/logs?pagination=cursor&end_time=5000&userId=user'],
    ['applicationId', '/logs?pagination=cursor&end_time=5000&applicationId=app'],
    ['logKey', '/logs?pagination=cursor&end_time=5000&logKey=key'],
    ['invalid pagination', '/logs?pagination=page&end_time=5000'],
    ['cursor without cursor mode', '/logs?end_time=5000&cursor=not-a-cursor'],
    ['limit without cursor mode', '/logs?end_time=5000&limit=10'],
  ])('returns 400 for %s', async (_name, path) => {
    const response = await logRequest.get(path);

    expect(response.status).toEqual(400);
    expect(findLogsForCursor).not.toHaveBeenCalled();
  });
});
