import { UserLogType, UserLogResult, LogType, LogResult } from '@logto/schemas';

import { insertLog } from '@/queries/log';
import { insertUserLog } from '@/queries/user-log';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaUserLog, { WithLogContext, LogContext, UserLogContext } from './koa-user-log';

const nanoIdMock = 'mockId';

jest.mock('@/queries/log', () => ({
  insertLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('@/queries/user-log', () => ({
  insertUserLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => nanoIdMock),
}));

describe('koaUserLog middleware', () => {
  const insertLogMock = insertLog as jest.Mock;
  /** @deprecated */
  const insertUserLogMock = insertUserLog as jest.Mock;
  const next = jest.fn();

  const logMock: Partial<LogContext> = {
    type: LogType.SignInUsernamePassword,
    applicationId: 'foo',
    userId: 'foo',
    username: 'Foo Bar',
  };
  /** @deprecated */
  const userLogMock: Partial<UserLogContext> = {
    userId: 'foo',
    type: UserLogType.SignInEmail,
    email: 'foo@logto.io',
    payload: { applicationId: 'foo' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('insert userLog with success response', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
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

    expect(ctx.userLog).toHaveProperty('userId', userLogMock.userId);
    expect(ctx.userLog).toHaveProperty('type', userLogMock.type);
    expect(ctx.userLog).toHaveProperty('email', userLogMock.email);
    expect(ctx.userLog).toHaveProperty('payload', userLogMock.payload);
    expect(ctx.userLog.createdAt).not.toBeFalsy();
    expect(insertUserLogMock).toBeCalledWith({
      id: nanoIdMock,
      userId: ctx.userLog.userId,
      type: ctx.userLog.type,
      result: UserLogResult.Success,
      payload: ctx.userLog.payload,
    });
  });

  it('should not block request if insertLog throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    const error = new Error('failed to insert log');
    insertLogMock.mockImplementationOnce(async () => {
      throw error;
    });
    insertUserLogMock.mockImplementationOnce(async () => {
      throw error;
    });

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
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

    expect(ctx.userLog).toHaveProperty('userId', userLogMock.userId);
    expect(ctx.userLog).toHaveProperty('type', userLogMock.type);
    expect(ctx.userLog).toHaveProperty('email', userLogMock.email);
    expect(ctx.userLog).toHaveProperty('payload', userLogMock.payload);
    expect(ctx.userLog.createdAt).not.toBeFalsy();
    expect(insertUserLogMock).toBeCalledWith({
      id: nanoIdMock,
      userId: ctx.userLog.userId,
      type: ctx.userLog.type,
      result: UserLogResult.Success,
      payload: ctx.userLog.payload,
    });
  });

  it('should insert userLog with failed result if next throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log: {}, // Bypass middleware context type assert
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    const error = new Error('next error');

    next.mockImplementationOnce(async () => {
      ctx.log = logMock;
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
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

    expect(ctx.userLog.createdAt).not.toBeFalsy();
    expect(insertUserLogMock).toBeCalledWith({
      id: nanoIdMock,
      userId: ctx.userLog.userId,
      type: ctx.userLog.type,
      result: UserLogResult.Failed,
      payload: ctx.userLog.payload,
    });
  });
});
