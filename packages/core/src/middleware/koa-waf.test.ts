import type { WafFinding } from '@logto/waf';
import { noop } from '@silverhand/essentials';
import type Koa from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { SilentConsoleLog } from '#src/utils/console.js';

import koaWaf, { type KoaWafEvent } from './koa-waf.js';

const { jest } = import.meta;
const finding: WafFinding = { ruleId: 'unsupported-method' };
const createContext = (method: 'GET' | 'TRACE' = 'GET', url = '/') => {
  const context = createMockContext({
    method,
    url,
    customProperties: { requestId: 'request_123' },
  });
  return context;
};
const createNext = () => jest.fn(async () => true);

describe('koaWaf()', () => {
  it('bypasses inspection in off mode', async () => {
    const inspect = jest.fn(() => {
      throw new Error('must not run');
    });
    const next = createNext();

    await koaWaf({ mode: 'off', inspect })(createContext(), next);

    expect(inspect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('reports every finding and continues in report mode', async () => {
    const report = jest.fn();
    const next = createNext();
    const inspect = jest.fn(() => [
      finding,
      { ruleId: 'request-target-too-long' } satisfies WafFinding,
    ]);

    await koaWaf({ mode: 'report', inspect, report })(createContext('TRACE', '/secret'), next);

    expect(report).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns the same generic 403 for blocked requests', async () => {
    const next = createNext();
    const context = createContext('TRACE', '/secret');

    await koaWaf({ mode: 'block' })(context, next);

    expect(context.status).toBe(403);
    expect(context.body).toEqual({ code: 'request.blocked', message: 'Request blocked.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not report legitimate encoded OIDC queries', async () => {
    const report = jest.fn();
    const next = createNext();
    const context = createContext(
      'GET',
      '/oidc/auth?redirect_uri=https%3A%2F%2Fchip.example%2Fcallback&state=a%2Fb'
    );

    await koaWaf({ mode: 'report', report })(context, next);

    expect(report).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('uses the sanitized request console when no reporter is provided', async () => {
    const consoleLog = new SilentConsoleLog();
    const warn = jest.spyOn(consoleLog, 'warn');
    const context = createMockContext({
      method: 'TRACE',
      url: '/private?token=must-not-appear',
      customProperties: { requestId: 'request_123', console: consoleLog },
    });

    await koaWaf({ mode: 'report' })(context, createNext());

    expect(warn).toHaveBeenCalledWith('WAF request finding', {
      requestId: 'request_123',
      method: 'TRACE',
      ruleId: 'unsupported-method',
      mode: 'report',
      targetLength: context.req.url?.length ?? 0,
    });
    expect(JSON.stringify(warn.mock.calls)).not.toContain('must-not-appear');
  });

  it('loads runtime configuration for every request without recreating middleware', async () => {
    const getConfig = jest
      .fn()
      .mockResolvedValueOnce({ mode: 'report', maxRequestTargetLength: 8192 })
      .mockResolvedValueOnce({ mode: 'block', maxRequestTargetLength: 8192 });
    const middleware = koaWaf({ getConfig });
    const first = createContext('TRACE');
    const second = createContext('TRACE');
    const firstNext = createNext();
    const secondNext = createNext();

    await middleware(first, firstNext);
    await middleware(second, secondNext);

    expect(getConfig).toHaveBeenCalledTimes(2);
    expect(firstNext).toHaveBeenCalledTimes(1);
    expect(second.status).toBe(403);
    expect(secondNext).not.toHaveBeenCalled();
  });

  it.each([
    [
      'inspector',
      () =>
        koaWaf({
          mode: 'block',
          inspect: () => {
            throw new Error('failure');
          },
        }),
    ],
    [
      'reporter',
      () =>
        koaWaf({
          mode: 'block',
          inspect: () => [finding],
          report: () => {
            throw new Error('failure');
          },
        }),
    ],
  ])('fails open when the %s throws', async (_name, createMiddleware) => {
    const next = createNext();
    const context = createContext('TRACE');

    await createMiddleware()(context, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(context.status).not.toBe(403);
  });

  it('emits only allowlisted metadata', async () => {
    const report = jest.fn<void, [KoaWafEvent]>();
    const secret = 'secret-token-value';
    const context = createMockContext({
      method: 'TRACE',
      url: `/private?token=${secret}`,
      headers: {
        authorization: `Bearer ${secret}`,
        cookie: `session=${secret}`,
        'x-forwarded-for': '203.0.113.10',
      },
      customProperties: { requestId: 'request_123' },
    });

    await koaWaf({ mode: 'report', report })(context, noop as Koa.Next);

    expect(report).toHaveBeenCalledTimes(1);
    expect(report).toHaveBeenCalledWith({
      requestId: 'request_123',
      method: 'TRACE',
      ruleId: 'unsupported-method',
      mode: 'report',
      targetLength: context.req.url?.length ?? 0,
    });
    const events = report.mock.calls.map(([event]) => event);
    expect(JSON.stringify(events)).not.toContain(secret);
    expect(events[0]).not.toHaveProperty('rawTarget');
    expect(events[0]).not.toHaveProperty('headers');
    expect(events[0]).not.toHaveProperty('ip');
  });
});
