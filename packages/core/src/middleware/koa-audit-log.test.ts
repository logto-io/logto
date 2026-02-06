import type { LogKey } from '@logto/schemas';
import { LogResult, VerificationType } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import i18next from 'i18next';
import type { Context } from 'koa';
import Router, { type IRouterParamContext } from 'koa-router';
import { UAParser } from 'ua-parser-js';

import type Queries from '#src/tenants/Queries.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';

import { type TotpVerificationRecordData } from '../routes/experience/classes/verifications/totp-verification.js';

import type { WithLogContext, LogPayload } from './koa-audit-log.js';

const { jest } = import.meta;

await mockIdGenerators();

const { mockEsm } = createMockUtils(jest);
const getIsDevFeaturesEnabled = jest.fn(() => true);

mockEsm('#src/env-set/index.js', () => ({
  EnvSet: {
    values: {
      get isDevFeaturesEnabled() {
        return getIsDevFeaturesEnabled();
      },
    },
  },
}));

const insertLog = jest.fn();
const queries = { logs: { insertLog } } as unknown as Queries;

const { default: koaLog } = await import('./koa-audit-log.js');
const { default: RequestError } = await import('#src/errors/RequestError/index.js');

type TestContext = WithLogContext<IRouterParamContext & Context>;
const createTestContext = (headers: Record<string, string>): TestContext => {
  const ctx = createMockContext({ headers });

  return {
    ...ctx,
    params: {},
    headers: ctx.headers,
    router: new Router(),
    _matchedRoute: undefined,
    _matchedRouteName: undefined,
    i18n: i18next,
    locale: 'en',
    emailI18n: { locale: 'en' },
  } as unknown as TestContext;
};

describe('koaAuditLog middleware', () => {
  const logKey: LogKey = 'Interaction.SignIn.Identifier.VerificationCode.Submit';
  const mockPayload: LogPayload = {
    userId: 'foo',
    username: 'Bar',
  };

  const ip = '192.168.0.1';
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';
  const userAgentParsed = new UAParser(userAgent).getResult();

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    getIsDevFeaturesEnabled.mockReturnValue(true);
  });

  it('should insert a success log when next() does not throw an error', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;
    const additionalMockPayload: LogPayload = { foo: 'bar' };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append(additionalMockPayload);
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...mockPayload,
        ...additionalMockPayload,
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
        userAgentParsed,
      },
    });
  });

  it('should include sign-in context when mapped headers are present', async () => {
    const ctx: TestContext = createTestContext({
      'user-agent': userAgent,
      'x-logto-cf-country': 'US',
      'x-logto-cf-city': 'New York',
    });
    ctx.request.ip = ip;

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...mockPayload,
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
        userAgentParsed,
        signInContext: {
          country: 'US',
          city: 'New York',
        },
      },
    });
  });

  it('should skip sign-in context and parsed user agent when dev features are disabled', async () => {
    getIsDevFeaturesEnabled.mockReturnValue(false);
    const ctx: TestContext = createTestContext({
      'user-agent': userAgent,
      'x-logto-cf-country': 'US',
    });
    ctx.request.ip = ip;

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...mockPayload,
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
      },
    });
  });

  it('should insert multiple success logs when needed', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;
    const additionalMockPayload: LogPayload = { foo: 'bar' };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append(additionalMockPayload);
      const log2 = ctx.createLog(logKey);
      log2.append(mockPayload);
    };
    await koaLog(queries)(ctx, next);

    const basePayload = {
      ...mockPayload,
      key: logKey,
      result: LogResult.Success,
      ip,
      userAgent,
      userAgentParsed,
    };

    expect(insertLog).toHaveBeenCalledWith({
      id: mockId,
      key: logKey,
      payload: basePayload,
    });
    expect(insertLog).toHaveBeenCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...basePayload,
        ...additionalMockPayload,
      },
    });
  });

  it('should not log when there is no log type', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    // eslint-disable-next-line unicorn/consistent-function-scoping, @typescript-eslint/no-empty-function
    const next = async () => {};
    await koaLog(queries)(ctx, next);
    expect(insertLog).not.toBeCalled();
  });

  it('should filter password sensitive data in log', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const additionalMockPayload = {
      password: '123456',
      interaction: { profile: { password: 123_456 } },
    };

    const maskedAdditionalMockPayload = {
      password: '******',
      interaction: { profile: { password: '******' } },
    };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append(additionalMockPayload);
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...mockPayload,
        ...maskedAdditionalMockPayload,
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
        userAgentParsed,
      },
    });
  });

  it('should filter TOTP secret in log', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const mockVerificationData: TotpVerificationRecordData = {
      id: mockId,
      userId: 'foo',
      verified: true,
      type: VerificationType.TOTP,
      secret: 'foo_secret',
    };

    const maskedMockVerificationData: TotpVerificationRecordData = {
      ...mockVerificationData,
      secret: '******',
    };

    const next = async () => {
      const log = ctx.createLog(logKey);
      log.append(mockPayload);
      log.append({
        verifications: [mockVerificationData],
      });
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        ...mockPayload,
        verifications: [maskedMockVerificationData],
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
        userAgentParsed,
      },
    });
  });

  describe('should insert an error log with the error message when next() throws an error', () => {
    it('should log with error message when next throws a normal Error', async () => {
      const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
      ctx.request.ip = ip;

      const message = 'Normal error';
      const error = new Error(message);

      const next = async () => {
        const log = ctx.createLog(logKey);
        log.append(mockPayload);
        throw error;
      };
      await expect(koaLog(queries)(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toBeCalledWith({
        id: mockId,
        key: logKey,
        payload: {
          ...mockPayload,
          key: logKey,
          result: LogResult.Error,
          error: { message: `Error: ${message}` },
          ip,
          userAgent,
          userAgentParsed,
        },
      });
    });

    it('should update all logs with error result when next() throws a RequestError', async () => {
      const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
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
      await expect(koaLog(queries)(ctx, next)).rejects.toMatchError(error);

      expect(insertLog).toHaveBeenCalledTimes(2);
      expect(insertLog).toBeCalledWith({
        id: mockId,
        key: logKey,
        payload: {
          ...mockPayload,
          key: logKey,
          result: LogResult.Error,
          error: { message, code, data },
          ip,
          userAgent,
          userAgentParsed,
        },
      });
    });
  });
});
