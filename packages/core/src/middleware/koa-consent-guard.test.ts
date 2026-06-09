import { OneTimeTokenStatus } from '@logto/schemas';
import { NotFoundError } from '@silverhand/slonik';
import { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaConsentGuard from './koa-consent-guard.js';

const { jest } = import.meta;

describe('koaConsentGuard middleware', () => {
  const provider = new Provider('https://logto.test');
  const activeOneTimeToken = {
    token: 'token_value',
    email: 'foo@example.com',
    status: OneTimeTokenStatus.Active,
    context: {
      jitOrganizationIds: ['org_id'],
    },
  };
  const consumedOneTimeToken = {
    token: 'token_value',
    status: OneTimeTokenStatus.Consumed,
    context: {
      jitOrganizationIds: ['org_id'],
    },
  };

  const checkOneTimeToken = jest.fn().mockResolvedValue(activeOneTimeToken);
  const updateOneTimeTokenStatus = jest.fn().mockResolvedValue(consumedOneTimeToken);
  const provisionOrganizations = jest.fn();
  const findUserById = jest.fn().mockResolvedValue({ primaryEmail: 'foo@example.com' });

  const mockTenant = new MockTenant(
    provider,
    {
      users: {
        findUserById,
      },
    },
    undefined,
    {
      oneTimeTokens: { checkOneTimeToken, updateOneTimeTokenStatus },
      users: { provisionOrganizations },
    }
  );

  const next = jest.fn();

  beforeEach(() => {
    checkOneTimeToken.mockResolvedValue(activeOneTimeToken);
    updateOneTimeTokenStatus.mockResolvedValue(consumedOneTimeToken);
    findUserById.mockResolvedValue({ primaryEmail: 'foo@example.com' });
  });

  afterEach(() => {
    jest.resetAllMocks();
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
      // @ts-expect-error -- Only accountId is needed by this middleware.
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
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'bar' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, jest.fn());
    expect(checkOneTimeToken).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('switch-account?login_hint=bar%40example.com&one_time_token=abcdefg')
    );
  });

  it('should redirect to switch account page without checking token state if email does not match', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'bar@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(checkOneTimeToken).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'switch-account?login_hint=bar%40example.com&one_time_token=token_value'
      )
    );
  });

  it('should redirect to one-time-token page if valid token matches the current session user', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    checkOneTimeToken.mockResolvedValueOnce({
      token: 'token_value',
      email: 'foo@example.com',
      status: OneTimeTokenStatus.Active,
      context: {
        jitOrganizationIds: ['org_id'],
      },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'one-time-token?login_hint=foo%40example.com&one_time_token=token_value'
      )
    );
    expect(provisionOrganizations).not.toHaveBeenCalled();
    expect(updateOneTimeTokenStatus).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should redirect to one-time-token page if the original prompt contains login', async () => {
    const ctx = createContext({
      params: {
        one_time_token: 'token_value',
        login_hint: 'bar@example.com',
        prompt: 'login consent',
      },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'one-time-token?login_hint=bar%40example.com&one_time_token=token_value'
      )
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next middleware if token is consumed and session matches the token email', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    checkOneTimeToken.mockImplementationOnce(() => {
      throw new RequestError('one_time_token.token_consumed');
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('should call next middleware if token is consumed and last submitted login matches the token email', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'bar@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
      lastSubmission: {
        login: {
          accountId: 'bar',
        },
      },
    });
    findUserById
      .mockResolvedValueOnce({ primaryEmail: 'foo@example.com' })
      .mockResolvedValueOnce({ primaryEmail: 'bar@example.com' });
    checkOneTimeToken.mockImplementationOnce(() => {
      throw new RequestError('one_time_token.token_consumed');
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.redirect).not.toHaveBeenCalled();
  });

  it('should redirect to switch account page if token email does not match the session and no submitted login is found', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'bar@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(checkOneTimeToken).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'switch-account?login_hint=bar%40example.com&one_time_token=token_value'
      )
    );
  });

  it('should redirect to switch account page if the last submitted login user is not found', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'bar@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
      lastSubmission: {
        login: {
          accountId: 'bar',
        },
      },
    });
    findUserById
      .mockResolvedValueOnce({ primaryEmail: 'foo@example.com' })
      .mockRejectedValueOnce(new NotFoundError());
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);

    expect(next).not.toHaveBeenCalled();
    expect(checkOneTimeToken).not.toHaveBeenCalled();
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining(
        'switch-account?login_hint=bar%40example.com&one_time_token=token_value'
      )
    );
  });

  it('should throw if the last submitted login lookup fails unexpectedly', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'bar@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
      lastSubmission: {
        login: {
          accountId: 'bar',
        },
      },
    });
    const databaseError = new Error('database unavailable');
    findUserById
      .mockResolvedValueOnce({ primaryEmail: 'foo@example.com' })
      .mockRejectedValueOnce(databaseError);
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await expect(guard(ctx, next)).rejects.toThrow(databaseError);

    expect(checkOneTimeToken).not.toHaveBeenCalled();
  });

  it('should navigate to `/one-time-token` route with error message in URL params, if the one-time token is not valid', async () => {
    const ctx = createContext({
      params: { one_time_token: 'token_value', login_hint: 'foo@example.com' },
      // @ts-expect-error -- Only accountId is needed by this middleware.
      session: { accountId: 'foo' },
    });
    checkOneTimeToken.mockImplementationOnce(() => {
      throw new RequestError('one_time_token.token_expired');
    });
    const guard = koaConsentGuard(mockTenant.libraries, mockTenant.queries);

    await guard(ctx, next);
    expect(ctx.redirect).toHaveBeenCalledWith(
      expect.stringContaining('one-time-token?errorMessage=The+token+is+expired.')
    );
  });
});
