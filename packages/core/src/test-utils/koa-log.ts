import { LogEntry } from '#src/middleware/koa-audit-log.js';

const { jest } = import.meta;

class MockLogEntry extends LogEntry {
  append = jest.fn();
}

export const createMockLogContext = () => {
  const mockLogEntry = new MockLogEntry('Unknown');

  return { createLog: jest.fn(() => mockLogEntry), mockAppend: mockLogEntry.append };
};
