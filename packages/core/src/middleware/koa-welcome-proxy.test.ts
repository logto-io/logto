import { MountedApps } from '@/env-set';
import { hasActiveUsers } from '@/queries/user';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaWelcomeProxy from './koa-welcome-proxy';

jest.mock('@/queries/user', () => ({
  hasActiveUsers: jest.fn(),
}));

describe('koaWelcomeProxy', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should redirect to admin console if has AdminUsers', async () => {
    (hasActiveUsers as jest.Mock).mockResolvedValue(true);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy()(ctx, next);

    expect(ctx.redirect).toBeCalledWith(`/${MountedApps.Console}`);
    expect(next).not.toBeCalled();
  });

  it('should redirect to welcome page if has no Users', async () => {
    (hasActiveUsers as jest.Mock).mockResolvedValue(false);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaWelcomeProxy()(ctx, next);
    expect(ctx.redirect).toBeCalledWith(`/${MountedApps.Console}/welcome`);
    expect(next).not.toBeCalled();
  });
});
