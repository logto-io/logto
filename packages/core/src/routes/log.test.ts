import { LogResult, token, interaction, LogKeyUnknown, jwtCustomizer, saml } from '@logto/schemas';
import type { Log } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockBody = { key: 'a', payload: { key: 'a', result: LogResult.Success }, createdAt: 123 };
const mockLog: Log = { tenantId: 'fake_tenant', id: '1', ...mockBody };
const mockLogs = [mockLog, { tenantId: 'fake_tenant', id: '2', ...mockBody }];

const logs = {
  countLogs: jest.fn().mockResolvedValue({
    count: mockLogs.length,
  }),
  findLogs: jest.fn().mockResolvedValue(mockLogs),
  findLogById: jest.fn().mockResolvedValue(mockLog),
};
const { countLogs, findLogs, findLogById } = logs;
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
          includeKeyPrefix: [
            token.Type.ExchangeTokenBy,
            token.Type.RevokeToken,
            token.Type.RevokeGrants,
            interaction.prefix,
            jwtCustomizer.prefix,
            saml.prefix,
            LogKeyUnknown,
          ],
        },
        { capped: false }
      );
      expect(findLogs).toHaveBeenCalledWith(5, 0, {
        payload: { userId, applicationId },
        logKey,
        includeKeyPrefix: [
          token.Type.ExchangeTokenBy,
          token.Type.RevokeToken,
          token.Type.RevokeGrants,
          interaction.prefix,
          jwtCustomizer.prefix,
          saml.prefix,
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

      it('returns 400 when start_time >= end_time', async () => {
        const response = await logRequest.get(`/logs?start_time=2000&end_time=1000`);
        expect(response.status).toEqual(400);
        expect(countLogs).not.toHaveBeenCalled();
      });

      it('returns 400 when start_time equals end_time', async () => {
        const response = await logRequest.get(`/logs?start_time=1000&end_time=1000`);
        expect(response.status).toEqual(400);
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
});
