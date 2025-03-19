import { Provider, errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConsentGuard from './koa-consent-guard.js';

const { jest } = import.meta;

describe('koaConsentGuard middleware', () => {
  const provider = new Provider('https://logto.test');
  const interactionDetails = jest.spyOn(provider, 'interactionDetails');
  const verifyOneTimeToken = jest.fn();

  const tenant = new MockTenant(
    undefined,
    {
      users: {
        findUserById: jest.fn().mockResolvedValue({ primaryEmail: 'foo@example.com' }),
      },
    },
    undefined,
    {
      oneTimeTokens: { verifyOneTimeToken },
    }
  );
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if session is not found', async () => {
    // @ts-expect-error
    interactionDetails.mockResolvedValue({
      params: { token: 'token', login_hint: 'foo@example.com' },
      session: undefined,
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, tenant.libraries, tenant.queries);

    await expect(guard(ctx, next)).rejects.toThrow(errors.SessionNotFound);
  });

  it('should not block if token or login_hint are not provided', async () => {
    interactionDetails.mockResolvedValue({
      params: { token: '', login_hint: '' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, tenant.libraries, tenant.queries);

    await guard(ctx, next);
    expect(tenant.queries.users.findUserById).not.toHaveBeenCalled();
    expect(tenant.libraries.oneTimeTokens.verifyOneTimeToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should redirect to switch account page if email does not match', async () => {
    interactionDetails.mockResolvedValue({
      params: { token: 'abcdefg', login_hint: 'bar@example.com' },
      // @ts-expect-error
      session: { accountId: 'bar' },
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, tenant.libraries, tenant.queries);

    await guard(ctx, jest.fn());
    expect(ctx.redirect).toHaveBeenCalledWith(expect.stringContaining('switch-account'));
  });

  it('should call next middleware if validations pass', async () => {
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    interactionDetails.mockResolvedValue({
      params: { token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    verifyOneTimeToken.mockResolvedValueOnce({ token: 'token_value', email: 'foo@example.com' });
    const guard = koaConsentGuard(provider, tenant.libraries, tenant.queries);

    await guard(ctx, next);
    expect(next).toHaveBeenCalled();
  });

  it('should redirect to error page on one-time token verification failure', async () => {
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    interactionDetails.mockResolvedValue({
      params: { token: 'token', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    verifyOneTimeToken.mockRejectedValue(new RequestError('one_time_token.token_consumed'));
    const guard = koaConsentGuard(provider, tenant.libraries, tenant.queries);

    await guard(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('code=one_time_token.token_consumed')
    );
  });
});
