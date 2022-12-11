import { mockEsmDefault, pickDefault } from '@logto/shared/esm';

import envSet, { MountedApps } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockProxyMiddleware = jest.fn();
const mockStaticMiddleware = jest.fn();

mockEsmDefault('fs/promises', () => ({
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

  for (const app of Object.values(MountedApps)) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    it(`${app} path should not call dev proxy`, async () => {
      const ctx = createContextWithRouteParameters({
        url: `/${app}/foo`,
      });

      await koaSpaProxy()(ctx, next);

      expect(mockProxyMiddleware).not.toBeCalled();
    });
  }

  it('dev env should call dev proxy for SPA paths', async () => {
    const ctx = createContextWithRouteParameters();
    await koaSpaProxy()(ctx, next);
    expect(mockProxyMiddleware).toBeCalled();
  });

  it('production env should overwrite the request path to root if no target ui file are detected', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      isProduction: true,
    });

    const ctx = createContextWithRouteParameters({
      url: '/foo',
    });

    await koaSpaProxy()(ctx, next);

    expect(mockStaticMiddleware).toBeCalled();
    expect(ctx.request.path).toEqual('/');
    spy.mockRestore();
  });

  it('production env should call the static middleware if path hit the ui file directory', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      isProduction: true,
    });

    const ctx = createContextWithRouteParameters({
      url: '/sign-in',
    });

    await koaSpaProxy()(ctx, next);
    expect(mockStaticMiddleware).toBeCalled();
    spy.mockRestore();
  });
});
