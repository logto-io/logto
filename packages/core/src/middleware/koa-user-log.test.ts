import { UserLogType, UserLogResult } from '@logto/schemas';

import { insertUserLog } from '@/queries/user-log';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaUserLog, { WithUserLogContext, LogContext } from './koa-user-log';

const nanoIdMock = 'mockId';

jest.mock('@/queries/user-log', () => ({
  insertUserLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => nanoIdMock),
}));

describe('koaUserLog middleware', () => {
  const insertUserLogMock = insertUserLog as jest.Mock;
  const next = jest.fn();

  const userLogMock: Partial<LogContext> = {
    userId: 'foo',
    type: UserLogType.SignInEmail,
    email: 'foo@logto.io',
    payload: { applicationId: 'foo' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insert userLog with success response', async () => {
    const ctx: WithUserLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    next.mockImplementationOnce(async () => {
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
    });

    await koaUserLog()(ctx, next);
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
    const ctx: WithUserLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    insertUserLogMock.mockRejectedValue(new Error(' '));

    next.mockImplementationOnce(async () => {
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
    });

    await koaUserLog()(ctx, next);
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
    const ctx: WithUserLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      userLog: {
        payload: {},
        createdAt: 0,
      }, // Bypass middleware context type assert
    };

    const error = new Error('next error');

    next.mockImplementationOnce(async () => {
      ctx.userLog = {
        ...ctx.userLog,
        ...userLogMock,
      };
      throw error;
    });

    await expect(koaUserLog()(ctx, next)).rejects.toMatchError(error);

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
