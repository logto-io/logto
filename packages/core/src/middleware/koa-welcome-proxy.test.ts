import { mockEsm, pickDefault } from '@logto/shared/esm';

import envSet, { MountedApps } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const hasActiveUsers = jest.fn();

mockEsm('#src/queries/user.js', () => ({
  hasActiveUsers,
}));

const koaWelcomeProxy = await pickDefault(import('./koa-welcome-proxy.js'));

describe('koaWelcomeProxy', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should redirect to admin console if has AdminUsers', async () => {
    const { endpoint } = envSet.values;
    hasActiveUsers.mockResolvedValue(true);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy()(ctx, next);

    expect(ctx.redirect).toBeCalledWith(`${endpoint}/${MountedApps.Console}`);
    expect(next).not.toBeCalled();
  });

  it('should redirect to welcome page if has no Users', async () => {
    const { endpoint } = envSet.values;
    hasActiveUsers.mockResolvedValue(false);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy()(ctx, next);
    expect(ctx.redirect).toBeCalledWith(`${endpoint}/${MountedApps.Console}/welcome`);
    expect(next).not.toBeCalled();
  });
});
