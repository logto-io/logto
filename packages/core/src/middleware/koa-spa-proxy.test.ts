import { MountedApps } from '@/env-set';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaSpaProxy from './koa-spa-proxy';

const mockProxyMiddleware = jest.fn();
const mockStaticMiddleware = jest.fn();

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  readdir: jest.fn().mockResolvedValue(['sign-in']),
}));

jest.mock('koa-proxies', () => jest.fn(() => mockProxyMiddleware));
jest.mock('koa-static', () => jest.fn(() => mockStaticMiddleware));

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
    process.env.NODE_ENV = 'production';
    process.env.PASSWORD_PEPPERS = JSON.stringify(['foo']);
    process.env.DB_URL = 'some_db_url';

    const ctx = createContextWithRouteParameters({
      url: '/foo',
    });

    const { default: proxy } = await import('./koa-spa-proxy');
    await proxy()(ctx, next);

    expect(mockStaticMiddleware).toBeCalled();
    expect(ctx.request.path).toEqual('/');
  });

  it('production env should call the static middleware if path hit the ui file directory', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PASSWORD_PEPPERS = JSON.stringify(['foo']);
    process.env.DB_URL = 'some_db_url';

    const { default: proxy } = await import('./koa-spa-proxy');
    const ctx = createContextWithRouteParameters({
      url: '/sign-in',
    });

    await proxy()(ctx, next);
    expect(mockStaticMiddleware).toBeCalled();
  });
});
