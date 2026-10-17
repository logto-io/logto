import { createServer } from 'node:http';

import { pickDefault } from '@logto/shared/esm';
import Koa from 'koa';
import request from 'supertest';

const { jest } = import.meta;

const getTenantId = jest.fn();
const tenantPoolGet = jest.fn();
const trackException = jest.fn();
const wafMiddleware = jest.fn(async (_context: Koa.Context, next: Koa.Next) => next());
const koaWaf = jest.fn(() => wafMiddleware);

class TenantNotFoundError extends Error {}

jest.unstable_mockModule('@logto/app-insights/node', () => ({
  appInsights: {
    trackException,
  },
}));

jest.unstable_mockModule('#src/tenants/index.js', () => ({
  TenantNotFoundError,
  tenantPool: {
    get: tenantPoolGet,
  },
}));

jest.unstable_mockModule('#src/utils/tenant.js', () => ({
  getTenantId,
}));

jest.unstable_mockModule('#src/middleware/koa-waf.js', () => ({
  default: koaWaf,
}));

const initI18n = await pickDefault(import('../i18n/init.js'));
const initApp = await pickDefault(import('./init.js'));

describe('App Init', () => {
  const listenMock = jest
    .spyOn(Koa.prototype, 'listen')
    .mockImplementation(jest.fn(() => createServer()));

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    await initApp(app);

    expect(listenMock).toBeCalled();
  });

  it('logs tenant initialization errors to the request console', async () => {
    const tenantError = new Error('tenant init failed');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    getTenantId.mockResolvedValueOnce(['default', false]);
    tenantPoolGet.mockRejectedValueOnce(tenantError);

    try {
      const app = new Koa();
      await initApp(app);

      const response = await request(app.callback()).get('/');

      expect(response.status).toBe(500);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError.mock.calls[0]).toContain(tenantError);
      expect(trackException).toHaveBeenCalledWith(tenantError, expect.any(Object));
    } finally {
      consoleError.mockRestore();
    }
  });

  it('runs WAF after request context setup and before tenant resolution', async () => {
    wafMiddleware.mockClear();
    getTenantId.mockClear();
    getTenantId.mockResolvedValueOnce([undefined, false]);
    const app = new Koa();
    await initApp(app);

    await request(app.callback()).get('/oidc/auth').expect(404);

    expect(koaWaf).toHaveBeenCalledWith(expect.objectContaining({ mode: 'report' }));
    expect(wafMiddleware).toHaveBeenCalledTimes(1);
    expect(wafMiddleware.mock.calls[0]?.[0].requestId).toEqual(expect.any(String));
    expect(wafMiddleware.mock.invocationCallOrder[0]).toBeLessThan(
      getTenantId.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY
    );
  });
});
