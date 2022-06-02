import { MountedApps } from '@/env-set';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaRootProxy from './koa-root-proxy';

describe('koaRootProxy', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to console', async () => {
    const ctx = createContextWithRouteParameters({
      url: '/',
    });

    await koaRootProxy()(ctx, next);

    expect(ctx.redirect).toBeCalledWith(`/${MountedApps.Console}`);
    expect(next).not.toBeCalled();
  });

  it('should not redirect to console', async () => {
    const ctx = createContextWithRouteParameters({
      url: '/sign-in',
    });

    await koaRootProxy()(ctx, next);

    expect(ctx.redirect).not.toBeCalled();
    expect(next).toBeCalled();
  });
});
