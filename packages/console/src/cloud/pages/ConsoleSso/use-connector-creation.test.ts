import { SsoProviderName } from '@logto/schemas';
import { act, waitFor } from '@testing-library/react';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  mockApi,
  onCreated,
  operation,
  paidConnectors,
  paidSession,
  renderCreation,
} from './use-connector-creation.test-helpers';

it('automatically uses personal billing only after server billing reads finish', async () => {
  const { result } = renderCreation();
  expect(result.current.billing.isBillingReady).toBe(false);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  expect(result.current.billing.funding).toBe('personal');
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('automatically uses Enterprise allowance before an existing personal subscription', async () => {
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [{ id: 'enterprise-one' }] };
    }
    if (path === '/api/me/logto-enterprises/:id') {
      return {
        quotaScope: 'shared',
        quota: { basicQuota: { consoleSsoConnectorLimit: 2 } },
        usages: { consoleSsoConnectorLimit: 1 },
        subscription: { status: 'active' },
      };
    }
    return [];
  });
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post.mock.calls).toEqual([
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
  ]);
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
});

it.each([false, true])(
  'automatically starts Checkout when no allowance is available (Enterprise: %s)',
  async (hasEnterprise) => {
    const assign = jest.fn();
    jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign });
    mockApi.get.mockImplementation(async (path: string) => {
      if (path === '/api/me/logto-enterprises') {
        return { logtoEnterprises: hasEnterprise ? [{ id: 'enterprise-one' }] : [] };
      }
      if (path === '/api/me/logto-enterprises/:id') {
        return {
          quotaScope: 'shared',
          quota: { basicQuota: { consoleSsoConnectorLimit: 1 } },
          usages: { consoleSsoConnectorLimit: 1 },
          subscription: { status: 'active' },
        };
      }
      return [];
    });
    mockApi.post.mockResolvedValue({
      ...paidSession,
      status: 'open',
      subscriptionId: null,
      redirectUri: 'https://checkout.stripe.com/session-one',
    });
    const { result } = renderCreation();
    await waitFor(() => {
      expect(result.current.billing.isBillingReady).toBe(true);
    });
    await act(async () => {
      await result.current.create(SsoProviderName.OIDC);
    });
    expect(mockApi.post.mock.calls).toEqual([
      ['/api/me/console-sso/checkout-session', { body: { providerName: SsoProviderName.OIDC } }],
    ]);
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/session-one');
  }
);

it('automatically creates on the reusable subscription returned by enrollment', async () => {
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    return [];
  });
  mockApi.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'personal-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post.mock.calls).toEqual([
    ['/api/me/console-sso/checkout-session', { body: { providerName: SsoProviderName.OIDC } }],
    [
      '/api/me/console-sso/connectors',
      { body: { providerName: SsoProviderName.OIDC, stripeUserSubscriptionId: 'personal-sub' } },
    ],
  ]);
});

it('recovers a closed-tab payment without loading a new checkout preview or allowance', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return paidSession;
    }
    if (path === '/api/me/console-sso/connectors') {
      return paidConnectors;
    }
    return [];
  });
  const { result } = renderCreation();
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
  expect(result.current.billing.billingError).toBeUndefined();
  expect(result.current.billing.isBillingReady).toBe(true);
  await act(async () => {
    await result.current.create(SsoProviderName.SAML);
  });
  expect(mockApi.post).not.toHaveBeenCalled();
  expect(onCreated).toHaveBeenCalledWith(undefined);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('does not reload allowance or create a connector after a recovered lookup fails', async () => {
  savePendingConnectorCreation('alice', { ...operation, subscriptionId: 'paid-sub' });
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      throw new Error('Core unavailable');
    }
    return [];
  });
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(result.current.status).toBe('error');
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
  expect(result.current.operation?.subscriptionId).toBe('paid-sub');
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('polls delayed payment and webhook fulfillment without creating another connector', async () => {
  savePendingConnectorCreation('alice', operation);
  const sessionResponses = jest
    .fn()
    .mockResolvedValueOnce({ ...paidSession, status: 'payment_pending' })
    .mockResolvedValue(paidSession);
  const isFulfilled = jest.fn(() => false);
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [] };
    }
    if (path === '/api/me/console-sso/checkout-session/:sessionId') {
      return sessionResponses();
    }
    if (path === '/api/me/console-sso/connectors') {
      return isFulfilled() ? paidConnectors : [];
    }
    return [];
  });
  jest.useFakeTimers();
  const { result } = renderCreation();
  await act(async () => {
    jest.advanceTimersByTime(0);
  });
  expect(result.current.status).toBe('payment_pending');
  expect(mockApi.post).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(result.current.status).toBe('payment_pending');
  expect(onCreated).not.toHaveBeenCalled();
  expect(result.current.operation?.subscriptionId).toBe('paid-sub');
  isFulfilled.mockReturnValue(true);
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(onCreated).toHaveBeenCalledWith(undefined);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('stops payment polling after the creation modal unmounts', async () => {
  savePendingConnectorCreation('alice', operation);
  jest.useFakeTimers();
  const { unmount } = renderCreation();
  unmount();
  await act(async () => {
    jest.advanceTimersByTime(10_000);
  });
  expect(
    mockApi.get.mock.calls.some(
      ([path]) => path === '/api/me/console-sso/checkout-session/:sessionId'
    )
  ).toBe(false);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('enables fresh billing reads after abandoning an old paid intention', async () => {
  savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: undefined,
    subscriptionId: 'canceled-sub',
  });
  const { result } = renderCreation();
  expect(result.current.billing.isBillingReady).toBe(true);
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  mockApi.get.mockClear();
  await act(async () => {
    await result.current.startOver();
  });
  expect(result.current.operation).toBeUndefined();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/console-sso/connectors');
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/console-sso/checkout-preview');
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/logto-enterprises');
});
