import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConsentGuard from './koa-consent-guard.js';

const { jest } = import.meta;

describe('koaConsentGuard middleware', () => {
  const provider = new Provider('https://logto.test');
  const interactionDetails = jest.spyOn(provider, 'interactionDetails');

  const mockQueries = new MockQueries({
    users: {
      findUserById: jest.fn().mockResolvedValue({ primaryEmail: 'foo@example.com' }),
    },
  });

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if session is not found', async () => {
    // @ts-expect-error
    interactionDetails.mockResolvedValue({
      params: { one_time_token: 'token', login_hint: 'foo@example.com' },
      session: undefined,
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, mockQueries);

    await expect(guard(ctx, next)).rejects.toThrow(new RequestError({ code: 'session.not_found' }));
  });

  it('should not block if token or login_hint are not provided', async () => {
    interactionDetails.mockResolvedValue({
      params: { one_time_token: '', login_hint: '' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, mockQueries);

    await guard(ctx, next);
    expect(mockQueries.users.findUserById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should redirect to switch account page if email does not match', async () => {
    interactionDetails.mockResolvedValue({
      params: { one_time_token: 'abcdefg', login_hint: 'bar@example.com' },
      // @ts-expect-error
      session: { accountId: 'bar' },
    });
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    const guard = koaConsentGuard(provider, mockQueries);

    await guard(ctx, jest.fn());
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('switch-account?login_hint=bar%40example.com&one_time_token=abcdefg')
    );
  });

  it('should call next middleware if validations pass', async () => {
    const ctx = createContextWithRouteParameters({
      url: `/consent`,
    });
    interactionDetails.mockResolvedValue({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(provider, mockQueries);

    await guard(ctx, next);
    expect(next).toHaveBeenCalled();
  });
});
