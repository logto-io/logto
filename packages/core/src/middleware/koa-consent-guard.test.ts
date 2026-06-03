import { OneTimeTokenStatus } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConsentGuard from './koa-consent-guard.js';

const { jest } = import.meta;

describe('koaConsentGuard middleware', () => {
  const provider = new Provider('https://logto.test');

  const checkOneTimeToken = jest.fn().mockResolvedValue({
    token: 'token_value',
    email: 'foo@example.com',
    status: OneTimeTokenStatus.Active,
    context: {
      jitOrganizationIds: ['org_id'],
    },
  });
  const updateOneTimeTokenStatus = jest.fn().mockResolvedValue({
    token: 'token_value',
    status: OneTimeTokenStatus.Consumed,
    context: {
      jitOrganizationIds: ['org_id'],
    },
  });
  const provisionOrganizations = jest.fn();

  const mockTenant = new MockTenant(
    provider,
    {
      users: {
        findUserById: jest.fn().mockResolvedValue({ primaryEmail: 'foo@example.com' }),
      },
    },
    undefined,
    {
      oneTimeTokens: { checkOneTimeToken, updateOneTimeTokenStatus },
      users: { provisionOrganizations },
    }
  );

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createContext = (
    interactionDetails: Partial<Awaited<ReturnType<typeof provider.interactionDetails>>>
  ) => ({
    ...createContextWithRouteParameters({
      url: `/consent`,
    }),
    interactionDetails: interactionDetails as Awaited<
      ReturnType<typeof provider.interactionDetails>
    >,
  });

  it('should throw an error if session is not found', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token', login_hint: 'foo@example.com' },
      session: undefined,
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await expect(guard(ctx, next)).rejects.toThrow(new RequestError({ code: 'session.not_found' }));
  });

  it('should not block if token or login_hint are not provided', async () => {
    const ctx = createContext({
      params: { one_time_token: '', login_hint: '' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);
    expect(mockTenant.queries.users.findUserById).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should redirect to switch account page if email does not match', async () => {
    const ctx = createContext({
      params: { one_time_token: 'abcdefg', login_hint: 'bar@example.com' },
      // @ts-expect-error
      session: { accountId: 'bar' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, jest.fn());
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('switch-account?login_hint=bar%40example.com&one_time_token=abcdefg')
    );
  });

  it('should provision user to organizations on consent, if a valid one-time token is provided and there are organizations in token context', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    checkOneTimeToken.mockResolvedValue({
      token: 'token_value',
      email: 'foo@example.com',
      status: OneTimeTokenStatus.Active,
      context: {
        jitOrganizationIds: ['org_id'],
      },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(provisionOrganizations).toHaveBeenCalledWith({
      userId: 'foo',
      organizationIds: ['org_id'],
    });
    expect(updateOneTimeTokenStatus).toHaveBeenCalledWith(
      'token_value',
      OneTimeTokenStatus.Consumed
    );
    expect(next).toHaveBeenCalled();
  });

  it('should call next middleware if validations pass', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);
    expect(next).toHaveBeenCalled();
  });

  it('should navigate to `/one-time-token` route with error message in URL params, if the one-time token is not valid', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error
      session: { accountId: 'foo' },
    });
    checkOneTimeToken.mockImplementationOnce(() => {
      throw new RequestError('one_time_token.token_expired');
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('one-time-token?errorMessage=The token is expired.')
    );
  });
});
