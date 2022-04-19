/** TODO: remove deprecated code after removing all usages (LOG-2220), and rename to koa-log */
import { LogType, LogResult } from '@logto/schemas';

import { insertLog } from '@/queries/log';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaUserLog, { WithLogContext, LogContext } from './koa-user-log';

const nanoIdMock = 'mockId';

jest.mock('@/queries/log', () => ({
  insertLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => nanoIdMock),
}));

describe('koaUserLog middleware', () => {
  const insertLogMock = insertLog as jest.Mock;
  const next = jest.fn();

  const logMock: Partial<LogContext> = {
    type: LogType.SignInUsernamePassword,
    applicationId: 'foo',
    userId: 'foo',
    username: 'Foo Bar',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('insert userLog with success response', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      /** @deprecated */
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
    });

    await koaUserLog()(ctx, next);

    const { type, ...rest } = logMock;
    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...rest,
        result: LogResult.Success,
      },
    });
  });

  it('should not block request if insertLog throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      /** @deprecated */
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    const error = new Error('failed to insert log');
    insertLogMock.mockImplementationOnce(async () => {
      throw error;
    });

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
    });

    await koaUserLog()(ctx, next);

    const { type, ...rest } = logMock;
    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...rest,
        result: LogResult.Success,
      },
    });
  });

  it('should insert userLog with failed result if next throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      /** @deprecated */
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    const error = new Error('next error');

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
      throw error;
    });

    await expect(koaUserLog()(ctx, next)).rejects.toMatchError(error);

    const { type, ...rest } = logMock;
    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...rest,
        result: LogResult.Error,
        error: String(error),
      },
    });
  });
});
