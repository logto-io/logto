import { SsoProviderName } from '@logto/schemas';
import { act, waitFor } from '@testing-library/react';

import {
  getPendingConnectorCreationStorageKey,
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

it.each([409, 503, 'network'])(
  'clears an unstarted personal creation after a preview failure (%s)',
  async (status) => {
    const failure = status === 'network' ? new Error('Network failed') : { response: { status } };
    savePendingConnectorCreation('alice', {
      key: 'creation-without-checkout',
      providerName: SsoProviderName.OIDC,
      funding: 'personal',
    });
    const first = renderCreation();
    mockApi.get.mockClear().mockRejectedValueOnce(failure);
    await act(async () => {
      await first.result.current.create(SsoProviderName.OIDC);
    });
    expect(toastResponseError).toHaveBeenCalledWith(failure);
    expect(first.result.current.status).toBe('error');
    expect(first.result.current.isSubmitting).toBe(false);
    expect(first.result.current.operation).toBeUndefined();
    expect(readPendingConnectorCreation('alice')).toBeUndefined();
    expect(mockChooseBillingCustomer).not.toHaveBeenCalled();
    expect(mockApi.post).not.toHaveBeenCalled();
    expect(mockApi.delete).not.toHaveBeenCalled();
    first.unmount();

    const { result } = renderCreation();
    expect(result.current.operation).toBeUndefined();
    expect(result.current.status).toBeUndefined();
    expect(result.current.isSubmitting).toBe(false);
    expect(onCreated).not.toHaveBeenCalled();
  }
);

it.each(['open', 'expired'])(
  'checks a recovered %s session immediately without continued polling',
  async (status) => {
    savePendingConnectorCreation('alice', operation);
    mockApi.get.mockResolvedValue({ ...paidSession, status, subscriptionId: null });
    jest.useFakeTimers();
    const { result } = renderCreation();
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current.status).toBe(status);
    expect(
      mockApi.get.mock.calls.filter(
        ([path]) => path === '/api/me/console-sso/checkout-session/:sessionId'
      )
    ).toHaveLength(1);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    expect(
      mockApi.get.mock.calls.filter(
        ([path]) => path === '/api/me/console-sso/checkout-session/:sessionId'
      )
    ).toHaveLength(1);
    expect(mockApi.post).not.toHaveBeenCalled();
  }
);

it('re-enables creation when the billing account dialog is canceled while restarting an expired session', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockResolvedValue({ ...paidSession, status: 'expired', subscriptionId: null });
  // eslint-disable-next-line unicorn/no-useless-undefined -- The dialog resolves to nothing on cancel.
  mockChooseBillingCustomer.mockResolvedValue(undefined);
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.status).toBe('expired');
  });
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockChooseBillingCustomer).toHaveBeenCalledTimes(1);
  expect(result.current.status).toBeUndefined();
  expect(result.current.isSubmitting).toBe(false);
  expect(mockApi.post).not.toHaveBeenCalled();
  const { sessionId, ...restarted } = operation;
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...restarted,
    checkoutKey: 'new-creation',
  });
  expect(onCreated).not.toHaveBeenCalled();
});

it('pauses pending payment checks after a minute and allows manual retry', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockResolvedValue({ ...paidSession, status: 'payment_pending' });
  jest.useFakeTimers();
  const { result } = renderCreation();
  await act(async () => {
    jest.advanceTimersByTime(0);
  });
  expect(result.current.status).toBe('payment_pending');
  await act(async () => {
    jest.advanceTimersByTime(60_000);
  });
  expect(result.current.status).toBe('error');
  expect(readPendingConnectorCreation('alice')).toEqual(operation);
  const requests = mockApi.get.mock.calls.length;
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(mockApi.get).toHaveBeenCalledTimes(requests);
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/console-sso/checkout-session/:sessionId' ? paidSession : paidConnectors
  );
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(onCreated).toHaveBeenCalledWith(undefined);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it('bounds paid-but-unfulfilled recovery and retries with reads only', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    subscriptionId: 'paid-sub',
  });
  const isFulfilled = jest.fn(() => false);
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/console-sso/checkout-session/:sessionId'
      ? paidSession
      : isFulfilled()
        ? paidConnectors
        : []
  );
  jest.useFakeTimers();
  const { result } = renderCreation();
  await act(async () => {
    jest.advanceTimersByTime(0);
  });
  expect(result.current.status).toBe('payment_pending');
  await act(async () => {
    jest.advanceTimersByTime(60_000);
  });
  expect(result.current.status).toBe('error');
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  const requests = mockApi.get.mock.calls.length;
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(mockApi.get).toHaveBeenCalledTimes(requests);
  isFulfilled.mockReturnValue(true);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(onCreated).toHaveBeenCalledWith(undefined);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(mockApi.post).not.toHaveBeenCalled();
});

it.each([false, true])(
  'releases a hung payment check at the deadline and ignores its late response (initial pending: %s)',
  async (initialPending) => {
    savePendingConnectorCreation('alice', operation);
    const oldResponse = deferred<typeof paidSession>();
    const retryResponse = deferred<typeof paidSession>();
    const checkout = jest.fn().mockReturnValue(oldResponse.promise);
    if (initialPending) {
      checkout.mockResolvedValueOnce({ ...paidSession, status: 'payment_pending' });
    }
    mockApi.get.mockImplementation(async (path: string) =>
      path === '/api/me/console-sso/checkout-session/:sessionId' ? checkout() : []
    );
    jest.useFakeTimers();
    const { result } = renderCreation();
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      jest.advanceTimersByTime(59_000);
    });
    expect(result.current.status).toBe('error');
    expect(result.current.isSubmitting).toBe(false);
    expect(readPendingConnectorCreation('alice')).toEqual(operation);
    expect(onCreated).not.toHaveBeenCalled();
    expect(toastResponseError).not.toHaveBeenCalled();

    checkout.mockReturnValue(retryResponse.promise);
    await act(async () => {
      void result.current.create(SsoProviderName.OIDC);
    });
    expect(checkout).toHaveBeenCalledTimes(initialPending ? 3 : 2);
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      oldResponse.resolve(paidSession);
    });
    expect(result.current.status).toBe('payment_pending');
    expect(result.current.isSubmitting).toBe(true);
    expect(readPendingConnectorCreation('alice')).toEqual(operation);
    expect(onCreated).not.toHaveBeenCalled();

    await act(async () => {
      retryResponse.resolve({ ...paidSession, status: 'open' });
    });
    expect(result.current.status).toBe('open');
    expect(result.current.isSubmitting).toBe(false);
    expect(mockApi.post).not.toHaveBeenCalled();
    expect(toastResponseError).not.toHaveBeenCalled();
  }
);

it('checks webhook fulfillment after cancellation discovers payment but cleanup fails', async () => {
  savePendingConnectorCreation('alice', operation);
  mockApi.get.mockResolvedValue({ ...paidSession, status: 'payment_pending' });
  jest.useFakeTimers();
  const { result } = renderCreation();
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(result.current.status).toBe('payment_pending');
  mockApi.delete
    .mockResolvedValueOnce(paidSession)
    .mockRejectedValueOnce(new Error('Cleanup failed'));
  await act(async () => {
    await result.current.startOver();
  });
  expect(result.current.status).toBe('error');
  expect(result.current.operation?.subscriptionId).toBe('paid-sub');
  expect(result.current.isSubmitting).toBe(false);
  mockApi.get.mockClear();
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/console-sso/checkout-session/:sessionId' ? paidSession : paidConnectors
  );
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.get).toHaveBeenCalledWith('/api/me/console-sso/checkout-session/:sessionId', {
    params: { sessionId: operation.sessionId },
  });
  expect(onCreated).toHaveBeenCalledWith(undefined);
  expect(mockApi.post).not.toHaveBeenCalled();
});

it.each([null, 'another-purchase'])(
  'stops the old modal when another tab clears or replaces its operation (%s)',
  async (replacementKey) => {
    savePendingConnectorCreation('alice', operation);
    const response = deferred<typeof paidSession>();
    mockApi.get.mockReturnValue(response.promise);
    jest.useFakeTimers();
    renderCreation();
    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    const replacement = replacementKey
      ? {
          ...operation,
          key: replacementKey,
          sessionId: 'new-session',
        }
      : undefined;
    await act(async () => {
      if (replacement) {
        savePendingConnectorCreation('alice', replacement);
      } else {
        localStorage.removeItem(getPendingConnectorCreationStorageKey('alice'));
      }
      const event = new Event('storage');
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Set read-only event fields without the constructor overload flagged by CodeQL.
      Object.defineProperties(event, {
        key: { value: getPendingConnectorCreationStorageKey('alice') },
        storageArea: { value: localStorage },
      });
      window.dispatchEvent(event);
      response.resolve({ ...paidSession, status: 'expired' });
    });
    expect(onCreated).toHaveBeenCalledWith();
    expect(readPendingConnectorCreation('alice')).toEqual(replacement ?? undefined);
    expect(mockApi.post).not.toHaveBeenCalled();
    expect(toastResponseError).not.toHaveBeenCalled();
  }
);

it('keeps a newer purchase when an old connector lookup arrives', async () => {
  savePendingConnectorCreation('alice', { ...operation, subscriptionId: 'paid-sub' });
  const response = deferred<typeof paidConnectors>();
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/console-sso/checkout-session/:sessionId' ? paidSession : response.promise
  );
  const { result } = renderCreation();
  const pending = act(async () => {
    const request = result.current.create(SsoProviderName.OIDC);
    await Promise.resolve();
    await Promise.resolve();
    savePendingConnectorCreation('alice', { ...operation, key: 'another-purchase' });
    response.resolve(paidConnectors);
    await request;
  });
  await pending;
  expect(readPendingConnectorCreation('alice')?.key).toBe('another-purchase');
  expect(onCreated).not.toHaveBeenCalledWith(undefined);
  expect(mockApi.post).not.toHaveBeenCalled();
  expect(toastResponseError).not.toHaveBeenCalled();
});
