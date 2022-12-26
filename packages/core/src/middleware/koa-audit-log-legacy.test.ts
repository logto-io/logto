import { LogResult } from '@logto/schemas';
import type { LogPayload } from '@logto/schemas/lib/types/log-legacy.js';
import { pickDefault, createMockUtils } from '@logto/shared/esm';
import i18next from 'i18next';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithLogContextLegacy } from './koa-audit-log-legacy.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

const nanoIdMock = 'mockId';

const addLogContext = jest.fn();
const log = jest.fn();

const { insertLog } = mockEsm('#src/queries/log.js', () => ({
  insertLog: jest.fn(),
}));

mockEsm('nanoid', () => ({
  nanoid: () => nanoIdMock,
}));

const koaLog = await pickDefault(import('./koa-audit-log-legacy.js'));

describe('koaLog middleware', () => {
  const type = 'SignInUsernamePassword';
  const mockPayload: LogPayload = {
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
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      // Bypass middleware context type assert
      addLogContext,
      log,
    };
    ctx.request.ip = ip;
    const additionalMockPayload: LogPayload = { foo: 'bar' };

    const next = async () => {
      ctx.log(type, mockPayload);
      ctx.log(type, additionalMockPayload);
    };
    await koaLog()(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: nanoIdMock,
      key: type,
      payload: {
        ...mockPayload,
        ...additionalMockPayload,
        result: LogResult.Success,
        ip,
        userAgent,
      },
    });
  });

  it('should not insert a log when there is no log type', async () => {
    const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      // Bypass middleware context type assert
      addLogContext,
      log,
    };
    ctx.request.ip = ip;

    // eslint-disable-next-line unicorn/consistent-function-scoping, @typescript-eslint/no-empty-function
    const next = async () => {};
    await koaLog()(ctx, next);
    expect(insertLog).not.toBeCalled();
  });

  describe('should insert an error log with the error message when next() throws an error', () => {
    it('should log with error message when next throws a normal Error', async () => {
      const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
        // Bypass middleware context type assert
        addLogContext,
        log,
      };
      ctx.request.ip = ip;

      const message = 'Normal error';
      const error = new Error(message);

      const next = async () => {
        ctx.log(type, mockPayload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toBeCalledWith({
        id: nanoIdMock,
        key: type,
        payload: {
          ...mockPayload,
          result: LogResult.Error,
          error: { message: `Error: ${message}` },
          ip,
          userAgent,
        },
      });
    });

    it('should insert an error log with the error body when next() throws a RequestError', async () => {
      const ctx: WithLogContextLegacy<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
        // Bypass middleware context type assert
        addLogContext,
        log,
      };
      ctx.request.ip = ip;

      const message = 'Error message';
      jest.spyOn(i18next, 't').mockReturnValueOnce(message); // Used in
      const code = 'connector.general';
      const data = { foo: 'bar', num: 123 };
      const error = new RequestError(code, data);

      const next = async () => {
        ctx.log(type, mockPayload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toBeCalledWith({
        id: nanoIdMock,
        key: type,
        payload: {
          ...mockPayload,
          result: LogResult.Error,
          error: { message, code, data },
          ip,
          userAgent,
        },
      });
    });
  });
});
