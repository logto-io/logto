import { Provider } from 'oidc-provider';

import { MountedApps } from '@/env-set';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaProxyGuard, { sessionNotFoundPath } from './koa-proxy-guard';

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  readdir: jest.fn().mockResolvedValue(['index.js']),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(),
  })),
}));

describe('koaProxyGuard', () => {
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
    it(`${app} path should not redirect`, async () => {
      const provider = new Provider('');
      const ctx = createContextWithRouteParameters({
        url: `/${app}/foo`,
      });

      await koaProxyGuard(provider)(ctx, next);

      expect(ctx.redirect).not.toBeCalled();
    });
  }

  it('should not redirect if session found', async () => {
    const provider = new Provider('');
    const ctx = createContextWithRouteParameters({
      url: `/sign-in`,
    });
    await koaProxyGuard(provider)(ctx, next);
    expect(ctx.redirect).not.toBeCalled();
  });

  it('should not redirect if path is sessionNotFoundPath', async () => {
    const provider = new Provider('');

    (provider.interactionDetails as jest.Mock).mockRejectedValue(new Error('session not found'));
    const ctx = createContextWithRouteParameters({
      url: `${sessionNotFoundPath}`,
    });
    await koaProxyGuard(provider)(ctx, next);
    expect(ctx.redirect).not.toBeCalled();
  });

  it('should redirect if session not found', async () => {
    const provider = new Provider('');

    (provider.interactionDetails as jest.Mock).mockRejectedValue(new Error('session not found'));
    const ctx = createContextWithRouteParameters({
      url: '/sign-in',
    });
    await koaProxyGuard(provider)(ctx, next);
    expect(ctx.redirect).toBeCalled();
  });
});
