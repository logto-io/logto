import { Provider } from 'oidc-provider';

import { MountedApps } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaSpaSessionGuard, { sessionNotFoundPath, guardedPath } from './koa-spa-session-guard.js';

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  readdir: jest.fn().mockResolvedValue(['index.js']),
}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails: jest.fn(),
  })),
}));

describe('koaSpaSessionGuard', () => {
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

      await koaSpaSessionGuard(provider)(ctx, next);

      expect(ctx.redirect).not.toBeCalled();
    });
  }

  it(`should not redirect for path ${sessionNotFoundPath}`, async () => {
    const provider = new Provider('');

    (provider.interactionDetails as jest.Mock).mockRejectedValue(new Error('session not found'));
    const ctx = createContextWithRouteParameters({
      url: `${sessionNotFoundPath}`,
    });
    await koaSpaSessionGuard(provider)(ctx, next);
    expect(ctx.redirect).not.toBeCalled();
  });

  it(`should not redirect for path /callback`, async () => {
    const provider = new Provider('');

    (provider.interactionDetails as jest.Mock).mockRejectedValue(new Error('session not found'));
    const ctx = createContextWithRouteParameters({
      url: '/callback/github',
    });
    await koaSpaSessionGuard(provider)(ctx, next);
    expect(ctx.redirect).not.toBeCalled();
  });

  it('should not redirect if session found', async () => {
    const provider = new Provider('');
    const ctx = createContextWithRouteParameters({
      url: `/sign-in`,
    });
    await koaSpaSessionGuard(provider)(ctx, next);
    expect(ctx.redirect).not.toBeCalled();
  });

  for (const path of guardedPath) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    it(`should redirect if session not found for ${path}`, async () => {
      const provider = new Provider('');

      (provider.interactionDetails as jest.Mock).mockRejectedValue(new Error('session not found'));
      const ctx = createContextWithRouteParameters({
        url: `${path}/foo`,
      });
      await koaSpaSessionGuard(provider)(ctx, next);
      expect(ctx.redirect).toBeCalled();
    });
  }
});
