import { pickDefault, createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet, UserApps } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsmDefault } = createMockUtils(jest);

const mockProxyMiddleware = jest.fn();
const mockStaticMiddleware = jest.fn();
const mountedApps = Object.values(UserApps);

mockEsmDefault('node:fs/promises', () => ({
  readdir: jest.fn().mockResolvedValue(['sign-in']),
}));

mockEsmDefault('koa-proxies', () => jest.fn(() => mockProxyMiddleware));
mockEsmDefault('#src/middleware/koa-serve-static.js', () => jest.fn(() => mockStaticMiddleware));

const koaSpaProxy = await pickDefault(import('./koa-spa-proxy.js'));

describe('koaSpaProxy middleware', () => {
  const envBackup = process.env;

  beforeEach(() => {
    process.env = { ...envBackup };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const next = jest.fn();

  for (const app of Object.values(mountedApps)) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    it(`${app} path should not call dev proxy`, async () => {
      const ctx = createContextWithRouteParameters({
        url: `/${app}/foo`,
      });

      await koaSpaProxy(mountedApps)(ctx, next);

      expect(mockProxyMiddleware).not.toBeCalled();
    });
  }

  it('dev env should call dev proxy for SPA paths', async () => {
    const ctx = createContextWithRouteParameters();
    await koaSpaProxy(mountedApps)(ctx, next);
    expect(mockProxyMiddleware).toBeCalled();
  });

  it('production env should overwrite the request path to root if no target ui file are detected', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isProduction: true,
    });

    const ctx = createContextWithRouteParameters({
      url: '/foo',
    });

    await koaSpaProxy(mountedApps)(ctx, next);

    expect(mockStaticMiddleware).toBeCalled();
    expect(ctx.request.path).toEqual('/');
    stub.restore();
  });

  it('production env should call the static middleware if path hit the ui file directory', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isProduction: true,
    });

    const ctx = createContextWithRouteParameters({
      url: '/sign-in',
    });

    await koaSpaProxy(mountedApps)(ctx, next);
    expect(mockStaticMiddleware).toBeCalled();
    stub.restore();
  });
});
