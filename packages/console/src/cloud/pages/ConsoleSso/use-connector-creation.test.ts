import { SsoProviderName } from '@logto/schemas';
import { act, waitFor } from '@testing-library/react';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  mockApi,
  mockChooseBillingCustomer,
  onCreated,
  operation,
  paidConnectors,
  paidSession,
  renderCreation,
  toastResponseError,
} from './use-connector-creation.test-helpers';

const deferred = <T>() => {
  const resolveResponse = jest.fn<void, [T]>();
  const promise = new Promise<T>((resolve) => {
    resolveResponse.mockImplementation(resolve);
  });
  return { promise, resolve: resolveResponse };
};

it('opens, regains focus and reopens without reading Enterprise coverage', async () => {
  const cache = new Map();
  const first = renderCreation(cache);
  first.unmount();
  const { result } = renderCreation(cache);
  await act(async () => {
    window.dispatchEvent(new Event('focus'));
  });
  expect(result.current.isSubmitting).toBe(false);
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('submits a new intent without choosing funding or loading billing data', async () => {
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post.mock.calls).toEqual([
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
  ]);
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
  expect(mockChooseBillingCustomer).not.toHaveBeenCalled();
  expect(onCreated).toHaveBeenCalledWith('connector-one');
});

it('saves the server-selected personal continuation before choosing a billing account', async () => {
  const assign = jest.fn();
  jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign });
  mockApi.post.mockResolvedValueOnce({ status: 'checkout_required' }).mockResolvedValueOnce({
    ...paidSession,
    status: 'open',
    subscriptionId: null,
    redirectUri: 'https://checkout.stripe.com/session-one',
  });
  mockChooseBillingCustomer.mockImplementation(async () => {
    expect(readPendingConnectorCreation('alice')?.funding).toBe('personal');
    return {};
  });
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post.mock.calls).toEqual([
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
    ['/api/me/console-sso/checkout-session', { body: { providerName: SsoProviderName.OIDC } }],
  ]);
  expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/session-one');
});

it('can cancel billing selection without opening a Checkout session', async () => {
  mockApi.post.mockResolvedValueOnce({ status: 'checkout_required' });
  // eslint-disable-next-line unicorn/no-useless-undefined -- The billing dialog resolves to nothing on cancel.
  mockChooseBillingCustomer.mockResolvedValue(undefined);
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(result.current.operation).toBeUndefined();
  expect(result.current.isSubmitting).toBe(false);
});

it('retries a failed server decision with the same unfunded operation key', async () => {
  const failure = new Error('Coverage unavailable');
  mockApi.post.mockRejectedValueOnce(failure);
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(result.current.isSubmitting).toBe(false);
  expect(readPendingConnectorCreation('alice')).toEqual({
    key: 'new-creation',
    providerName: SsoProviderName.OIDC,
  });
  expect(toastResponseError).toHaveBeenCalledWith(failure);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  expect(onCreated).toHaveBeenCalledWith('connector-one');
});

it('serializes repeated clicks while the server selects funding', async () => {
  const response = deferred<{ id: string }>();
  mockApi.post.mockResolvedValueOnce(response.promise);
  const { result } = renderCreation();
  await act(async () => {
    void result.current.create(SsoProviderName.OIDC);
    void result.current.create(SsoProviderName.SAML);
  });
  expect(result.current.isSubmitting).toBe(true);
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  await act(async () => {
    response.resolve({ id: 'connector-one' });
  });
  await waitFor(() => {
    expect(onCreated).toHaveBeenCalledWith('connector-one');
  });
});

it('does not start Checkout after the modal unmounts during the server decision', async () => {
  const response = deferred<{ status: 'checkout_required' }>();
  mockApi.post.mockResolvedValueOnce(response.promise);
  const { result, unmount } = renderCreation();
  await act(async () => {
    void result.current.create(SsoProviderName.OIDC);
  });
  unmount();
  await act(async () => {
    response.resolve({ status: 'checkout_required' });
  });
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  expect(mockChooseBillingCustomer).not.toHaveBeenCalled();
  expect(readPendingConnectorCreation('alice')?.funding).toBeUndefined();
  expect(onCreated).not.toHaveBeenCalled();
});

it.each([404, 409])(
  'preserves the saved Enterprise and funding after a %s rejection and retries after reload',
  async (status) => {
    const saved = savePendingConnectorCreation('alice', {
      key: 'original-key',
      providerName: SsoProviderName.OIDC,
      funding: 'included',
      enterpriseId: 'original-enterprise',
    });
    const failure = { response: { status }, message: 'Creation rejected' };
    mockApi.get.mockResolvedValue({ logtoEnterprises: [{ id: 'different-enterprise' }] });
    mockApi.post.mockRejectedValueOnce(failure);
    const first = renderCreation();
    await act(async () => {
      await first.result.current.create(SsoProviderName.SAML);
    });
    expect(first.result.current.status).toBe('error');
    expect(toastResponseError).toHaveBeenCalledWith(failure);
    expect(readPendingConnectorCreation('alice')).toEqual(saved);
    expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
    first.unmount();

    const { result } = renderCreation();
    expect(result.current.operation?.enterpriseId).toBe('original-enterprise');
    await act(async () => {
      await result.current.create(SsoProviderName.SAML);
    });
    expect(mockApi.post.mock.calls).toEqual(
      Array.from({ length: 2 }, () => [
        '/api/me/logto-enterprises/:id/console-sso/connectors',
        {
          params: { id: 'original-enterprise' },
          body: { providerName: SsoProviderName.OIDC },
        },
      ])
    );
    expect(onCreated).toHaveBeenCalledWith('connector-one');
  }
);

it('recovers a closed-tab payment without loading a new checkout preview or allowance', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockImplementation(async (path: string) => {
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

it('uses the server entry again after abandoning an old paid intention', async () => {
  savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: undefined,
    subscriptionId: 'canceled-sub',
  });
  const { result } = renderCreation();
  await act(async () => {
    await result.current.startOver();
  });
  expect(result.current.operation).toBeUndefined();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC },
  });
  expect(mockApi.get).not.toHaveBeenCalledWith('/api/me/logto-enterprises');
});
