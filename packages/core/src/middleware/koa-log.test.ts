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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('insert log with success response', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log, // Bypass middleware context type assert
    };

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
      },
    });
  });

  it('should not block request if insertLog throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log, // Bypass middleware context type assert
    };

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
      },
    });
  });

  it('should insert log with failed result if next throws error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters(),
      log, // Bypass middleware context type assert
    };

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
      },
    });
  });
});
