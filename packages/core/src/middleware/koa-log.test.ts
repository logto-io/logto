import { LogPayload, LogResult } from '@logto/schemas';

import { insertLog } from '@/queries/log';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaLog, { WithLogContext } from './koa-log';

const nanoIdMock = 'mockId';

const log = jest.fn();

jest.mock('@/queries/log', () => ({
  insertLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => nanoIdMock),
}));

describe('koaLog middleware', () => {
  const insertLogMock = insertLog as jest.Mock;
  const next = jest.fn();

  const type = 'SignInUsernamePassword';
  const payload: LogPayload = {
    userId: 'foo',
    username: 'Bar',
  };

  const ip = '192.168.0.1';
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('insert log with success response', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      log, // Bypass middleware context type assert
    };
    ctx.request.ip = ip;

    next.mockImplementationOnce(async () => {
      ctx.log(type, payload);
    });

    await koaLog()(ctx, next);

    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...payload,
        result: LogResult.Success,
        ip,
        userAgent,
      },
    });
  });

  it('should not block request if insertLog throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      log, // Bypass middleware context type assert
    };
    ctx.request.ip = ip;

    const error = new Error('Failed to insert log');
    insertLogMock.mockImplementationOnce(async () => {
      throw error;
    });

    next.mockImplementationOnce(async () => {
      ctx.log(type, payload);
    });

    await koaLog()(ctx, next);

    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...payload,
        result: LogResult.Success,
        ip,
        userAgent,
      },
    });
  });

  it('should insert log with failed result if next throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      log, // Bypass middleware context type assert
    };
    ctx.request.ip = ip;

    const error = new Error('next error');

    next.mockImplementationOnce(async () => {
      ctx.log(type, payload);
      throw error;
    });

    await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

    expect(insertLogMock).toBeCalledWith({
      id: nanoIdMock,
      type,
      payload: {
        ...payload,
        result: LogResult.Error,
        error: String(error),
        ip,
        userAgent,
      },
    });
  });
});
