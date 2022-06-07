import { LogPayload, LogResult } from '@logto/schemas';
import i18next from 'i18next';

import RequestError from '@/errors/RequestError';
import { insertLog } from '@/queries/log';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaLog, { WithLogContext } from './koa-log';

const nanoIdMock = 'mockId';

const addLogContext = jest.fn();
const log = jest.fn();

jest.mock('@/queries/log', () => ({
  insertLog: jest.fn(async () => Promise.resolve()),
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => nanoIdMock),
}));

describe('koaLog middleware', () => {
  const insertLogMock = insertLog as jest.Mock;
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

  it('should insert a success log when next() does not throw an error', async () => {
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      // Bypass middleware context type assert
      addLogContext,
      log,
    };
    ctx.request.ip = ip;

    const next = async () => {
      ctx.log(type, payload);
    };
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

  describe('should insert an error log with the error message when next() throws an error', () => {
    it('should log with error message when next throws a normal Error', async () => {
      const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
        // Bypass middleware context type assert
        addLogContext,
        log,
      };
      ctx.request.ip = ip;

      const message = 'normal error';
      const error = new Error(message);

      const next = async () => {
        ctx.log(type, payload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLogMock).toBeCalledWith({
        id: nanoIdMock,
        type,
        payload: {
          ...payload,
          result: LogResult.Error,
          error: `Error: ${message}`,
          ip,
          userAgent,
        },
      });
    });

    it('should insert an error log with the error body when next() throws a RequestError', async () => {
      const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
        // Bypass middleware context type assert
        addLogContext,
        log,
      };
      ctx.request.ip = ip;

      const errorMessage = 'Error message';
      jest.spyOn(i18next, 't').mockReturnValue(errorMessage);

      const error = new RequestError('connector.general', {
        foo: 'bar',
        num: 123,
      });

      const next = async () => {
        ctx.log(type, payload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLogMock).toBeCalledWith({
        id: nanoIdMock,
        type,
        payload: {
          ...payload,
          result: LogResult.Error,
          error: `{"message":"${errorMessage}","code":"connector.general","data":{"foo":"bar","num":123}}`,
          ip,
          userAgent,
        },
      });
    });
  });
});
