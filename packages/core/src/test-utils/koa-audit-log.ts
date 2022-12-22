import type { LogContext } from '#src/middleware/koa-audit-log.js';
import { LogEntry } from '#src/middleware/koa-audit-log.js';

const { jest } = import.meta;

class MockLogEntry extends LogEntry {
  append = jest.fn();
}

export const createMockLogContext = (): LogContext & { mockAppend: jest.Mock } => {
  const mockLogEntry = new MockLogEntry('Unknown');

  return {
    createLog: jest.fn(() => mockLogEntry),
    prependAllLogEntries: jest.fn(),
    getLogs: jest.fn(),
    mockAppend: mockLogEntry.append,
  };
};
