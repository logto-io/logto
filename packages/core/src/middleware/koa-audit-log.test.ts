import type { LogKey } from '@logto/schemas';
import { LogResult } from '@logto/schemas';
import { mockEsm, pickDefault } from '@logto/shared/esm';
import i18next from 'i18next';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithLogContext, LogPayload } from './koa-audit-log.js';

const { jest } = import.meta;

const nanoIdMock = 'mockId';

const { insertLog } = mockEsm('#src/queries/log.js', () => ({
  insertLog: jest.fn(),
}));

mockEsm('nanoid', () => ({
  nanoid: () => nanoIdMock,
}));

const koaLog = await pickDefault(import('./koa-audit-log.js'));

describe('koaAuditLog middleware', () => {
  const logKey: LogKey = 'Interaction.SignIn.Identifier.VerificationCode.Submit';
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
    // @ts-expect-error for testing
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
    };
    ctx.request.ip = ip;
    const additionalMockPayload: LogPayload = { foo: 'bar' };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append(additionalMockPayload);
    };
    await koaLog()(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: nanoIdMock,
      key: logKey,
      payload: {
        ...mockPayload,
        ...additionalMockPayload,
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
      },
    });
  });

  it('should insert multiple success logs when needed', async () => {
    // @ts-expect-error for testing
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
    };
    ctx.request.ip = ip;
    const additionalMockPayload: LogPayload = { foo: 'bar' };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append(additionalMockPayload);
      const log2 = ctx.createLog(logKey);
      log2.append(mockPayload);
    };
    await koaLog()(ctx, next);

    const basePayload = {
      ...mockPayload,
      key: logKey,
      result: LogResult.Success,
      ip,
      userAgent,
    };

    expect(insertLog).toHaveBeenCalledWith({
      id: nanoIdMock,
      key: logKey,
      payload: basePayload,
    });
    expect(insertLog).toHaveBeenCalledWith({
      id: nanoIdMock,
      key: logKey,
      payload: {
        ...basePayload,
        ...additionalMockPayload,
      },
    });
  });

  it('should not log when there is no log type', async () => {
    // @ts-expect-error for testing
    const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
    };
    ctx.request.ip = ip;

    // eslint-disable-next-line unicorn/consistent-function-scoping, @typescript-eslint/no-empty-function
    const next = async () => {};
    await koaLog()(ctx, next);
    expect(insertLog).not.toBeCalled();
  });

  describe('should insert an error log with the error message when next() throws an error', () => {
    it('should log with error message when next throws a normal Error', async () => {
      // @ts-expect-error for testing
      const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      };
      ctx.request.ip = ip;

      const message = 'Normal error';
      const error = new Error(message);

      const next = async () => {
        const log = ctx.createLog(logKey);
        log.append(mockPayload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toBeCalledWith({
        id: nanoIdMock,
        key: logKey,
        payload: {
          ...mockPayload,
          key: logKey,
          result: LogResult.Error,
          error: { message: `Error: ${message}` },
          ip,
          userAgent,
        },
      });
    });

    it('should update all logs with error result when next() throws a RequestError', async () => {
      // @ts-expect-error for testing
      const ctx: WithLogContext<ReturnType<typeof createContextWithRouteParameters>> = {
        ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      };
      ctx.request.ip = ip;

      const message = 'Error message';
      jest.spyOn(i18next, 't').mockReturnValueOnce(message); // Used in
      const code = 'connector.general';
      const data = { foo: 'bar', num: 123 };
      const error = new RequestError(code, data);

      const next = async () => {
        const log = ctx.createLog(logKey);
        log.append(mockPayload);
        const log2 = ctx.createLog(logKey);
        log2.append(mockPayload);
        throw error;
      };
      await expect(koaLog()(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toHaveBeenCalledTimes(2);
      expect(insertLog).toBeCalledWith({
        id: nanoIdMock,
        key: logKey,
        payload: {
          ...mockPayload,
          key: logKey,
          result: LogResult.Error,
          error: { message, code, data },
          ip,
          userAgent,
        },
      });
    });
  });
});
