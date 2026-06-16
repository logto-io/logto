import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaAccountCenterSsr from './koa-account-center-ssr.js';

const { jest } = import.meta;

const accountCenterSsrPlaceholder = '"__LOGTO_ACCOUNT_CENTER_SSR__"';
const mockAccountCenterSsrSignInExperience = { color: mockSignInExperience.color };

describe('koaAccountCenterSsr()', () => {
  const baseCtx = Object.freeze({
    ...createContextWithRouteParameters({}),
    query: {},
  });
  const tenant = new MockTenant(undefined, undefined, undefined, {
    signInExperiences: {
      getAccountCenterSsrSignInExperience: jest
        .fn()
        .mockResolvedValue(mockAccountCenterSsrSignInExperience),
      getFullSignInExperience: jest.fn(),
    },
  });

  const next = jest.fn().mockReturnValue(Promise.resolve());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and do nothing if the response body is not a string', async () => {
    const symbol = Symbol('nothing');
    const ctx = { ...baseCtx, body: symbol };
    await koaAccountCenterSsr(tenant.libraries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).toBe(symbol);
  });

  it('should call next() and do nothing if the placeholder is not present', async () => {
    const ctx = { ...baseCtx, path: '/', body: '...' };
    await koaAccountCenterSsr(tenant.libraries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).toBe('...');
  });

  it('should prefetch sign-in experience color data and inject it into the HTML response', async () => {
    const ctx = {
      ...baseCtx,
      path: '/',
      body: `<script>
        const logtoSsr=${accountCenterSsrPlaceholder};
      </script>`,
    };
    await koaAccountCenterSsr(tenant.libraries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(
      tenant.libraries.signInExperiences.getAccountCenterSsrSignInExperience
    ).toHaveBeenCalledTimes(1);
    expect(tenant.libraries.signInExperiences.getFullSignInExperience).not.toHaveBeenCalled();
    expect(ctx.body).not.toContain(accountCenterSsrPlaceholder);
    expect(ctx.body).toContain(
      `const logtoSsr=Object.freeze(${JSON.stringify({
        signInExperience: { data: mockAccountCenterSsrSignInExperience },
      })});`
    );
  });

  it('should inject SSR data for Account Center deep links', async () => {
    const ctx = {
      ...baseCtx,
      path: '/profile',
      body: `<script>
        const logtoSsr=${accountCenterSsrPlaceholder};
      </script>`,
    };
    await koaAccountCenterSsr(tenant.libraries)(ctx, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(ctx.body).not.toContain(accountCenterSsrPlaceholder);
    expect(ctx.body).toContain(
      `const logtoSsr=Object.freeze(${JSON.stringify({
        signInExperience: { data: mockSignInExperience },
      })});`
    );
  });
});
