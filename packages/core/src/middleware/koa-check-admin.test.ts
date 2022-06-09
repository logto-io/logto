import { MountedApps } from '@/env-set';
import { hasAdminUsers } from '@/queries/user';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaCheckAdmin from './koa-check-admin';

jest.mock('@/queries/user', () => ({
  hasAdminUsers: jest.fn(),
}));

describe('koaCheckAdmin', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should redirect to admin console if has AdminUsers', async () => {
    (hasAdminUsers as jest.Mock).mockResolvedValue(true);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaCheckAdmin()(ctx, next);

    expect(ctx.redirect).toBeCalledWith(`/${MountedApps.Console}`);
    expect(next).not.toBeCalled();
  });

  it('should redirect to register if has no AdminUsers', async () => {
    (hasAdminUsers as jest.Mock).mockResolvedValue(false);
    const ctx = createContextWithRouteParameters({
      url: `/${MountedApps.Welcome}`,
    });

    await koaCheckAdmin()(ctx, next);
    expect(ctx.redirect).toBeCalledWith(`/${MountedApps.Console}/register`);
    expect(next).not.toBeCalled();
  });
});
