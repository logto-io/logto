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

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

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
  findLogById: jest.fn().mockResolvedValue(toRow(mockLog)),
  deleteLogsBefore: jest.fn().mockResolvedValue({ deletedCount: 0 }),
};
const { countLogs, findLogs, findLogById, deleteLogsBefore } = logs;
const logRoutes = await pickDefault(import('./log.js'));

describe('logRoutes', () => {
  const logRequest = createRequester({
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
    it('deletes with parsed bounds and returns the summary', async () => {
      deleteLogsBefore.mockResolvedValueOnce({
        deletedCount: 2,
        deletedRange: { oldest: 1000, newest: 2000 },
      });

      const response = await logRequest.delete('/logs?before=5000&after=500&limit=10');

      expect(response.status).toEqual(200);
      expect(deleteLogsBefore).toHaveBeenCalledWith({ before: 5000, after: 500, limit: 10 });
      expect(response.body).toEqual({
        deletedCount: 2,
        hasMore: false,
        deletedRange: { oldest: 1000, newest: 2000 },
      });
    });

    it('defaults limit to 1000 and passes after as undefined when omitted', async () => {
      await logRequest.delete('/logs?before=5000');

      expect(deleteLogsBefore).toHaveBeenCalledWith({
        before: 5000,
        after: undefined,
        limit: 1000,
      });
    });

    it('reports hasMore=true when the batch was full', async () => {
      deleteLogsBefore.mockResolvedValueOnce({ deletedCount: 10 });

      const response = await logRequest.delete('/logs?before=5000&limit=10');

      expect(response.body).toEqual({ deletedCount: 10, hasMore: true });
    });

    it('omits deletedRange when nothing was deleted', async () => {
      const response = await logRequest.delete('/logs?before=5000');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ deletedCount: 0, hasMore: false });
    });

    it('returns 400 when before is missing', async () => {
      const response = await logRequest.delete('/logs');

      expect(response.status).toEqual(400);
      expect(deleteLogsBefore).not.toHaveBeenCalled();
    });

    it('returns 400 when before is in the future', async () => {
      const response = await logRequest.delete(`/logs?before=${Date.now() + 3_600_000}`);

      expect(response.status).toEqual(400);
      expect(deleteLogsBefore).not.toHaveBeenCalled();
    });

    it('returns 400 when after is not earlier than before', async () => {
      const sameBound = await logRequest.delete('/logs?before=5000&after=5000');
      expect(sameBound.status).toEqual(400);

      const inverted = await logRequest.delete('/logs?before=5000&after=6000');
      expect(inverted.status).toEqual(400);
      expect(deleteLogsBefore).not.toHaveBeenCalled();
    });

    it.each([
      ['zero', '0'],
      ['above the cap', '10001'],
      ['fractional', '1.5'],
      ['not a number', 'abc'],
    ])('returns 400 when limit is %s', async (_name, limit) => {
      const response = await logRequest.delete(`/logs?before=5000&limit=${limit}`);

      expect(response.status).toEqual(400);
      expect(deleteLogsBefore).not.toHaveBeenCalled();
    });

    it('returns 400 when before is not a finite number', async () => {
      const response = await logRequest.delete('/logs?before=abc');

      expect(response.status).toEqual(400);
      expect(deleteLogsBefore).not.toHaveBeenCalled();
    });
  });
});
