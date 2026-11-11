/* eslint-disable max-lines -- The GET /logs, export, detail and delete suites share one requester and mock set. */
import {
  LogResult,
  token,
  interaction,
  action,
  LogKeyUnknown,
  jwtCustomizer,
  saml,
  trustedDevice,
} from '@logto/schemas';
import type { Log, LogResponse } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

// The export route is registered only while the log export dev feature is enabled.
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

afterAll(() => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
});

const mockBody = { key: 'a', payload: { key: 'a', result: LogResult.Success }, createdAt: 123 };
const mockLog: LogResponse = { tenantId: 'fake_tenant', id: '1', ...mockBody };
const mockLogs = [mockLog, { tenantId: 'fake_tenant', id: '2', ...mockBody }];

// Rows as the queries return them: the trigger-kept lookup columns must not reach the response.
const toRow = (log: LogResponse): Log => ({
  ...log,
  payloadUserId: 'user',
  payloadApplicationId: 'application',
  payloadHookId: 'hook',
});

const logs = {
  countLogs: jest.fn().mockResolvedValue({
    count: mockLogs.length,
  }),
  findLogs: jest.fn().mockResolvedValue(mockLogs.map((log) => toRow(log))),
  findLogsForExport: jest.fn().mockResolvedValue([]),
  findLogById: jest.fn().mockResolvedValue(toRow(mockLog)),
  deleteLogsInRange: jest.fn().mockResolvedValue({ deletedCount: 0 }),
};
const { countLogs, findLogs, findLogsForExport, findLogById, deleteLogsInRange } = logs;
const logRoutes = await pickDefault(import('./log.js'));

describe('logRoutes', () => {
  const logRequest = createRequester({
    // The error handler and i18n middleware expose `RequestError` codes in the response body.
    middlewares: [koaI18next(), koaErrorHandler()],
    authedRoutes: logRoutes,
    tenantContext: new MockTenant(undefined, { logs }),
  });

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
      expect(countLogs).toHaveBeenCalledWith(
        {
          payload: { userId, applicationId },
          logKey,
          startTime: undefined,
          endTime: undefined,
          includeKeyPrefix: [
            token.Type.ExchangeTokenBy,
            token.Type.RevokeToken,
            token.Type.RevokeGrants,
            interaction.prefix,
            jwtCustomizer.prefix,
            saml.prefix,
            action.prefix,
            trustedDevice.prefix,
            LogKeyUnknown,
          ],
        },
        { capped: false }
      );
      expect(findLogs).toHaveBeenCalledWith(5, 0, {
        payload: { userId, applicationId },
        logKey,
        startTime: undefined,
        endTime: undefined,
        includeKeyPrefix: [
          token.Type.ExchangeTokenBy,
          token.Type.RevokeToken,
          token.Type.RevokeGrants,
          interaction.prefix,
          jwtCustomizer.prefix,
          saml.prefix,
          action.prefix,
          trustedDevice.prefix,
          LogKeyUnknown,
        ],
      });
    });

    it('should return correct response', async () => {
      const response = await logRequest.get(`/logs`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(mockLogs);
      expect(response.header).toHaveProperty('total-number', `${mockLogs.length}`);
      expect(response.header).not.toHaveProperty('total-number-is-capped');
    });

    describe('enableCap query param', () => {
      afterEach(() => {
        countLogs.mockResolvedValue({ count: mockLogs.length });
      });

      it('passes capped=true to countLogs when enableCap=true', async () => {
        countLogs.mockResolvedValueOnce({ count: 10_001, isCapped: true });

        const response = await logRequest.get(`/logs?enableCap=true`);
        expect(response.status).toEqual(200);
        expect(countLogs).toHaveBeenCalledWith(expect.any(Object), { capped: true });
        expect(response.header).toHaveProperty('total-number', '10001');
        expect(response.header).toHaveProperty('total-number-is-capped', 'true');
      });

      it('passes capped=false to countLogs when enableCap is omitted', async () => {
        await logRequest.get(`/logs`);
        expect(countLogs).toHaveBeenCalledWith(expect.any(Object), { capped: false });
      });
    });

    describe('start_time / end_time query params', () => {
      it('passes startTime to countLogs and findLogs when start_time is set', async () => {
        await logRequest.get(`/logs?start_time=1000`);
        expect(countLogs).toHaveBeenCalledWith(
          expect.objectContaining({ startTime: 1000, endTime: undefined }),
          expect.any(Object)
        );
        expect(findLogs).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.objectContaining({ startTime: 1000, endTime: undefined })
        );
      });

      it('passes endTime to countLogs and findLogs when end_time is set', async () => {
        await logRequest.get(`/logs?end_time=2000`);
        expect(countLogs).toHaveBeenCalledWith(
          expect.objectContaining({ startTime: undefined, endTime: 2000 }),
          expect.any(Object)
        );
        expect(findLogs).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.objectContaining({ startTime: undefined, endTime: 2000 })
        );
      });

      it('passes both bounds when start_time and end_time are set', async () => {
        await logRequest.get(`/logs?start_time=1000&end_time=2000`);
        expect(countLogs).toHaveBeenCalledWith(
          expect.objectContaining({ startTime: 1000, endTime: 2000 }),
          expect.any(Object)
        );
      });

      it('returns 400 when start_time > end_time', async () => {
        const response = await logRequest.get(`/logs?start_time=2000&end_time=1000`);
        expect(response.status).toEqual(400);
        expect(countLogs).not.toHaveBeenCalled();
      });

      it('succeeds when start_time equals end_time (inclusive bounds)', async () => {
        const response = await logRequest.get(`/logs?start_time=1000&end_time=1000`);
        expect(response.status).toEqual(200);
      });

      it('returns 400 when start_time is not a finite number', async () => {
        const response = await logRequest.get(`/logs?start_time=abc`);
        expect(response.status).toEqual(400);
      });

      it('returns 400 when end_time is not a finite number', async () => {
        const response = await logRequest.get(`/logs?end_time=NaN`);
        expect(response.status).toEqual(400);
      });
    });
  });

  describe('GET /logs/export', () => {
    const exportRow = {
      ...mockLog,
      createdAtCursor: '2026-11-11T04:40:45.123456Z',
    };

    beforeEach(() => {
      findLogsForExport.mockReset();
      findLogsForExport.mockResolvedValue([]);
    });

    // The route asks for an ascending first page and a descending newest row before it starts
    // streaming. Keep both probes consistent so page-resume assertions are not confused by the
    // range probe.
    const mockExportRows = (rows: Array<typeof exportRow>) => {
      findLogsForExport.mockImplementation(async (_limit, condition, order) => {
        if (order === 'desc') {
          const last = rows.at(-1);
          return last ? [last] : [];
        }

        return condition.after === undefined ? rows : [];
      });
    };

    it('streams CSV rows instead of resolving /logs/:id', async () => {
      mockExportRows([exportRow]);

      const response = await logRequest.get('/logs/export?format=csv&end_time=5000');

      expect(response.status).toEqual(200);
      expect(response.header['content-type']).toContain('text/csv');
      expect(response.header['content-disposition']).toMatch(
        /^attachment; filename="logs-.+\.csv"$/
      );
      expect(response.header['x-log-range-oldest']).toBe('123');
      expect(response.header['x-log-range-newest']).toBe('123');
      expect(findLogById).not.toHaveBeenCalled();

      const [header, csvRow] = response.text.split('\n');
      expect(header).toBe('tenantId,id,key,createdAt,payload');
      const match = /^fake_tenant,1,a,123,"(.*)"$/.exec(csvRow ?? '');
      expect(match).not.toBeNull();
      expect(JSON.parse((match?.[1] ?? '').replaceAll('""', '"'))).toEqual(mockLog.payload);
    });

    it('streams JSONL rows', async () => {
      mockExportRows([exportRow]);

      const response = await logRequest.get('/logs/export?format=jsonl&end_time=5000');

      expect(response.status).toEqual(200);
      expect(response.header['content-type']).toContain('application/x-ndjson');
      expect(response.header['content-disposition']).toMatch(
        /^attachment; filename="logs-.+\.jsonl"$/
      );
      expect(JSON.parse(response.text.trim())).toEqual({
        tenantId: mockLog.tenantId,
        id: mockLog.id,
        key: mockLog.key,
        createdAt: mockLog.createdAt,
        payload: mockLog.payload,
      });
    });

    it('passes the GET /logs filters and the delete-style window validation through', async () => {
      await logRequest.get(
        '/logs/export?format=jsonl&end_time=5000&start_time=1000&userId=user&applicationId=app&logKey=Key'
      );

      expect(findLogsForExport).toHaveBeenCalledWith(
        1000,
        expect.objectContaining({
          payload: { userId: 'user', applicationId: 'app' },
          logKey: 'Key',
          startTime: 1000,
          endTime: 5000,
          after: undefined,
        })
      );

      const [, condition] = findLogsForExport.mock.calls[0] as [
        number,
        { includeKeyPrefix?: unknown[] },
      ];
      // Webhook delivery logs are included by default; only the explicit opt-out narrows the
      // export to the audit-log key prefixes.
      expect(condition.includeKeyPrefix).toBeUndefined();
    });

    it('excludes webhook delivery logs when excludeWebhookLogs=true', async () => {
      await logRequest.get('/logs/export?format=jsonl&end_time=5000&excludeWebhookLogs=true');

      const [, condition] = findLogsForExport.mock.calls[0] as [
        number,
        { includeKeyPrefix?: unknown[] },
      ];
      expect(condition.includeKeyPrefix).toContain(interaction.prefix);
    });

    it('reports the actual exported range in headers', async () => {
      findLogsForExport.mockImplementation(async (_limit, condition, order) => {
        if (order === 'desc') {
          return [{ ...exportRow, createdAt: 900 }];
        }

        return condition.after === undefined ? [{ ...exportRow, createdAt: 123 }] : [];
      });

      const response = await logRequest.get('/logs/export?format=jsonl&end_time=5000');

      expect(response.header['x-log-range-oldest']).toBe('123');
      expect(response.header['x-log-range-newest']).toBe('900');
    });

    it('resumes after the last row of the previous page', async () => {
      mockExportRows([exportRow]);

      await logRequest.get('/logs/export?format=jsonl&end_time=5000');

      expect(findLogsForExport).toHaveBeenCalledWith(
        1000,
        expect.objectContaining({
          after: { createdAt: exportRow.createdAtCursor, id: exportRow.id },
        })
      );
    });

    it('accepts end_time=0 and start_time=0 as real bounds', async () => {
      const response = await logRequest.get('/logs/export?format=csv&end_time=0&start_time=0');

      expect(response.status).toEqual(200);
      expect(findLogsForExport).toHaveBeenCalledWith(
        1000,
        expect.objectContaining({ startTime: 0, endTime: 0 })
      );
      expect(response.text).toBe('tenantId,id,key,createdAt,payload\n');
      expect(response.header['x-log-range-oldest']).toBeUndefined();
    });

    it('returns 500 before sending the download when the first page fails', async () => {
      findLogsForExport.mockRejectedValueOnce(new Error('database unavailable'));

      const response = await logRequest.get('/logs/export?format=csv&end_time=5000');

      expect(response.status).toEqual(500);
      expect(response.header['content-disposition']).toBeUndefined();
    });

    it.each([
      ['missing format', '/logs/export?end_time=5000'],
      ['unknown format', '/logs/export?format=xml&end_time=5000'],
      ['missing end_time', '/logs/export?format=csv'],
      ['future end_time', `/logs/export?format=csv&end_time=${Date.now() + 3_600_000}`],
      ['inverted window', '/logs/export?format=csv&end_time=5000&start_time=6000'],
      ['empty start_time', '/logs/export?format=csv&end_time=5000&start_time='],
      ['negative end_time', '/logs/export?format=csv&end_time=-1'],
      ['fractional end_time', '/logs/export?format=csv&end_time=1.5'],
      ['invalid webhook exclusion', '/logs/export?format=csv&end_time=5000&excludeWebhookLogs=yes'],
    ])('returns 400 for %s', async (_name, path) => {
      const response = await logRequest.get(path);

      expect(response.status).toEqual(400);
      expect(findLogsForExport).not.toHaveBeenCalled();
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

  describe('DELETE /logs', () => {
    it('deletes within the window and returns the summary', async () => {
      deleteLogsInRange.mockResolvedValueOnce({
        deletedCount: 2,
        deletedRange: { oldest: 1000, newest: 2000 },
      });

      const response = await logRequest.delete('/logs?end_time=5000&start_time=500&limit=10');

      expect(response.status).toEqual(200);
      expect(deleteLogsInRange).toHaveBeenCalledWith(
        expect.objectContaining({ endTime: 5000, startTime: 500, limit: 10 })
      );
      expect(response.body).toEqual({
        deletedCount: 2,
        hasMore: false,
        deletedRange: { oldest: 1000, newest: 2000 },
      });
    });

    it('passes the window through without a key filter', async () => {
      await logRequest.delete('/logs?end_time=5000');

      const [condition] = deleteLogsInRange.mock.calls[0] as [Record<string, unknown>];

      // Webhook delivery logs share the `logs` table and are intentionally in scope here: adding
      // a key filter would keep the statement off the time index and make each batch of a purge
      // loop more expensive than the last.
      expect(condition).not.toHaveProperty('includeKeyPrefix');
    });

    it('defaults limit to 1000 and passes startTime as undefined when omitted', async () => {
      const response = await logRequest.delete('/logs?end_time=5000');

      expect(response.status).toEqual(200);
      expect(deleteLogsInRange).toHaveBeenCalledWith(
        expect.objectContaining({ endTime: 5000, startTime: undefined, limit: 1000 })
      );
    });

    it.each([
      ['minimum', '1', 1],
      ['maximum', '10000', 10_000],
    ])('accepts the %s limit of %s', async (_name, rawLimit, limit) => {
      const response = await logRequest.delete(`/logs?end_time=5000&limit=${rawLimit}`);

      expect(response.status).toEqual(200);
      expect(deleteLogsInRange).toHaveBeenCalledWith(expect.objectContaining({ limit }));
    });

    it('accepts end_time=0 (the unix epoch) rather than treating it as absent', async () => {
      const response = await logRequest.delete('/logs?end_time=0');

      expect(response.status).toEqual(200);
      expect(deleteLogsInRange).toHaveBeenCalledWith(expect.objectContaining({ endTime: 0 }));
    });

    it('accepts start_time=0 rather than dropping the lower bound', async () => {
      const response = await logRequest.delete('/logs?end_time=5000&start_time=0');

      expect(response.status).toEqual(200);
      expect(deleteLogsInRange).toHaveBeenCalledWith(
        expect.objectContaining({ endTime: 5000, startTime: 0 })
      );
    });

    it('reports hasMore=true when the batch was full', async () => {
      deleteLogsInRange.mockResolvedValueOnce({ deletedCount: 10 });

      const response = await logRequest.delete('/logs?end_time=5000&limit=10');

      expect(response.body).toEqual({ deletedCount: 10, hasMore: true });
    });

    it('omits deletedRange when nothing was deleted', async () => {
      const response = await logRequest.delete('/logs?end_time=5000');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ deletedCount: 0, hasMore: false });
    });

    it('returns 400 when end_time is missing', async () => {
      const response = await logRequest.delete('/logs');

      expect(response.status).toEqual(400);
      expect(deleteLogsInRange).not.toHaveBeenCalled();
    });

    it('returns 400 when end_time is in the future', async () => {
      const response = await logRequest.delete(`/logs?end_time=${Date.now() + 3_600_000}`);

      expect(response.status).toEqual(400);
      expect(response.body.code).toBe('log.cleanup_boundary_in_future');
      expect(deleteLogsInRange).not.toHaveBeenCalled();
    });

    it('returns 400 when start_time is after end_time', async () => {
      const inverted = await logRequest.delete('/logs?end_time=5000&start_time=6000');

      expect(inverted.status).toEqual(400);
      expect(inverted.body.code).toBe('log.invalid_time_window');
      expect(deleteLogsInRange).not.toHaveBeenCalled();
    });

    it.each([
      ['empty end_time', 'end_time='],
      ['whitespace end_time', 'end_time=%20%20'],
      ['empty start_time', 'end_time=5000&start_time='],
      ['negative end_time', 'end_time=-1'],
      ['end_time beyond the safe integer range', 'end_time=1e16'],
      ['non-finite end_time', 'end_time=abc'],
      ['non-finite start_time', 'end_time=5000&start_time=abc'],
    ])('returns 400 for %s instead of coercing it', async (_name, queryString) => {
      const response = await logRequest.delete(`/logs?${queryString}`);

      expect(response.status).toEqual(400);
      expect(response.body.code).toBe('guard.invalid_input');
      expect(deleteLogsInRange).not.toHaveBeenCalled();
    });

    it.each([
      ['zero', '0'],
      ['above the cap', '10001'],
      ['fractional', '1.5'],
      ['not a number', 'abc'],
    ])('returns 400 when limit is %s', async (_name, limit) => {
      const response = await logRequest.delete(`/logs?end_time=5000&limit=${limit}`);

      expect(response.status).toEqual(400);
      expect(deleteLogsInRange).not.toHaveBeenCalled();
    });
  });
});

/* eslint-enable max-lines */
