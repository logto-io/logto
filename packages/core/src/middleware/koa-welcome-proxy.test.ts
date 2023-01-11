import { pickDefault } from '@logto/shared/esm';

import { EnvSet, MountedApps } from '#src/env-set/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const hasActiveUsers = jest.fn();
const queries = new MockQueries({ users: { hasActiveUsers } });

const koaWelcomeProxy = await pickDefault(import('./koa-welcome-proxy.js'));

describe('koaWelcomeProxy', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should redirect to admin console if has AdminUsers', async () => {
    const { endpoint } = EnvSet.values;
    hasActiveUsers.mockResolvedValue(true);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy(queries)(ctx, next);

    expect(ctx.redirect).toBeCalledWith(`${endpoint}/${MountedApps.Console}`);
    expect(next).not.toBeCalled();
  });

  it('should redirect to welcome page if has no Users', async () => {
    const { endpoint } = EnvSet.values;
    hasActiveUsers.mockResolvedValue(false);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy(queries)(ctx, next);
    expect(ctx.redirect).toBeCalledWith(`${endpoint}/${MountedApps.Console}/welcome`);
    expect(next).not.toBeCalled();
  });
});
