/* eslint-disable max-lines -- Audit log middleware behavior is covered end to end. */
import type { LogKey } from '@logto/schemas';
import { LogResult, VerificationType } from '@logto/schemas';
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

  it('should include sign-in context and parsed user agent with partial sign-in context headers', async () => {
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
        userAgentParsed,
        signInContext: {
          country: 'US',
        },
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

  it('should filter sensitive data while preserving safe application secret metadata', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const additionalMockPayload = {
      password: '123456',
      interaction: { profile: { password: 123_456 } },
      applicationSecret: { name: 'rotation-2' },
      unsafe: {
        applicationSecret: { name: 'rotation-2', value: 'raw-application-secret' },
      },
    };

    const maskedAdditionalMockPayload = {
      password: '******',
      interaction: { profile: { password: '******' } },
      applicationSecret: { name: 'rotation-2' },
      unsafe: { applicationSecret: '******' },
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
    expect(JSON.stringify(insertLog.mock.calls)).not.toContain('raw-application-secret');
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

  it('should filter sensitive data added through common log context', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const next = async () => {
      ctx.createLog(logKey);
      ctx.prependAllLogEntries({
        interaction: {
          profile: {
            Password: 'password-from-common-context',
            clientSecret: 'secret-from-common-context',
            Authorization: 'Bearer private-authorization',
            passwordEncrypted: 'private-password-digest',
            socialConnectorTokenSetSecret: 'private-token-set',
            script: 'private-script',
            environmentVariables: { TOKEN: 'private-environment-value' },
            hasPassword: 'private-password-status',
            passwordVerified: true,
          },
        },
      });
    };

    await koaLog(queries)(ctx, next);

    expect(insertLog).toHaveBeenCalledWith({
      id: mockId,
      key: logKey,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      payload: expect.objectContaining({
        interaction: {
          profile: {
            Password: '******',
            clientSecret: '******',
            Authorization: '******',
            passwordEncrypted: '******',
            socialConnectorTokenSetSecret: '******',
            hasPassword: '******',
            passwordVerified: true,
          },
        },
      }),
    });
    const serializedPayload = JSON.stringify(insertLog.mock.calls);
    expect(serializedPayload).not.toContain('private-');
  });

  it('should strip null characters so the payload is safe to store as jsonb', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const next = async () => {
      const log = ctx.createLog(logKey);
      const nul = String.fromCodePoint(0);
      log.append({
        params: {
          grant_type: `authorization_code${nul}`,
          nested: [`a${nul}b`],
          [`field${nul}name`]: 'value',
          [`pass${nul}word`]: 'leaked-password',
          [`sec${nul}ret`]: 'leaked-secret',
        },
      });
    };
    await koaLog(queries)(ctx, next);

    expect(insertLog).toBeCalledWith({
      id: mockId,
      key: logKey,
      payload: {
        params: {
          grant_type: 'authorization_code',
          nested: ['ab'],
          fieldname: 'value',
          password: '******',
          secret: '******',
        },
        key: logKey,
        result: LogResult.Success,
        ip,
        userAgent,
        userAgentParsed,
      },
    });
  });

  it('should sanitize appended data immediately and protect reserved fields after canonicalization', async () => {
    const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
    ctx.request.ip = ip;

    const next = async () => {
      const log = ctx.createLog(logKey);
      const nul = String.fromCodePoint(0);

      log.append({
        [`pass${nul}word`]: 'leaked-password',
        [`${nul}key`]: 'Attacker.Controlled.Key',
        [`${nul}result`]: LogResult.Error,
      });

      expect(log.payload).toMatchObject({
        password: '******',
        key: logKey,
        result: LogResult.Success,
      });
      expect(JSON.stringify(log.payload)).not.toContain('leaked-password');
      expect(JSON.stringify(log.payload)).not.toContain('Attacker.Controlled.Key');
    };

    await koaLog(queries)(ctx, next);

    expect(insertLog).toHaveBeenCalledWith({
      id: mockId,
      key: logKey,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
      payload: expect.objectContaining({
        password: '******',
        key: logKey,
        result: LogResult.Success,
      }),
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

    it('should preserve an independent log result when the owning request later fails', async () => {
      const ctx: TestContext = createTestContext({ 'user-agent': userAgent });
      ctx.request.ip = ip;

      const error = new Error('Owning flow failed');
      const next = async () => {
        const independentLog = ctx.createLog(logKey, { independent: true });
        independentLog.append({ decision: 'updateUser' });
        ctx.createLog(logKey);
        throw error;
      };

      await expect(koaLog(queries)(ctx, next)).rejects.toBe(error);

      expect(insertLog).toHaveBeenCalledTimes(2);
      expect(insertLog).toHaveBeenCalledWith({
        id: mockId,
        key: logKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
        payload: expect.objectContaining({
          decision: 'updateUser',
          result: LogResult.Success,
        }),
      });
      expect(insertLog).toHaveBeenCalledWith({
        id: mockId,
        key: logKey,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest asymmetric matcher is typed as `any`.
        payload: expect.objectContaining({
          result: LogResult.Error,
          error: { message: 'Error: Owning flow failed' },
        }),
      });
    });
  });
});
/* eslint-enable max-lines */
