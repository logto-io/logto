import type { LogKey } from '@logto/schemas';

import type { LogPayload } from '#src/middleware/koa-audit-log.js';

const { jest } = import.meta;

export const createMockLogContext = () =>
  // eslint-disable-next-line @silverhand/fp/no-mutating-assign
  Object.assign(jest.fn<void, [LogPayload]>(), { setKey: jest.fn<void, [LogKey]>() });
