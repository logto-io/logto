import { LogResult } from '@logto/schemas';
import type { Log, LogResponse } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockBody = { key: 'a', payload: { key: 'a', result: LogResult.Success }, createdAt: 123 };
export const mockLog: LogResponse = { tenantId: 'fake_tenant', id: '1', ...mockBody };
export const mockLogs = [mockLog, { tenantId: 'fake_tenant', id: '2', ...mockBody }];

// Rows as the queries return them: the trigger-kept lookup columns must not reach the response.
const toRow = (log: LogResponse): Log => ({
  ...log,
  payloadUserId: 'user',
  payloadApplicationId: 'application',
  payloadHookId: 'hook',
});

export const createLogTestContext = async () => {
  const logs = {
    countLogs: jest.fn().mockResolvedValue({
      count: mockLogs.length,
    }),
    findLogs: jest.fn().mockResolvedValue(mockLogs.map((log) => toRow(log))),
    findLogsForExport: jest.fn().mockResolvedValue([]),
    findLogById: jest.fn().mockResolvedValue(toRow(mockLog)),
    deleteLogsInRange: jest.fn().mockResolvedValue({ deletedCount: 0 }),
  };
  const logRoutes = await pickDefault(import('./log.js'));
  const logRequest = createRequester({
    // The error handler and i18n middleware expose `RequestError` codes in the response body.
    middlewares: [koaI18next(), koaErrorHandler()],
    authedRoutes: logRoutes,
    tenantContext: new MockTenant(undefined, { logs }),
  });

  return { logs, logRequest };
};
