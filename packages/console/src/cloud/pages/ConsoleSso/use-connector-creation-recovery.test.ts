import { SsoProviderName } from '@logto/schemas';
import { act, waitFor } from '@testing-library/react';
import { unstable_serialize } from 'swr';

import {
  getPendingConnectorCreationStorageKey,
  readPendingConnectorCreation,
  savePendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  mockApi,
  onCreated,
  operation,
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
  mockApi.get.mockResolvedValue(paidSession);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(onCreated).toHaveBeenCalledWith('connector-one');
});

it('allows fulfillment retry after cancellation discovers payment but cleanup fails', async () => {
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
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(
    mockApi.get.mock.calls.every(
      ([path]) => path !== '/api/me/console-sso/checkout-session/:sessionId'
    )
  ).toBe(true);
  expect(onCreated).toHaveBeenCalledWith('connector-one');
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
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: getPendingConnectorCreationStorageKey('alice'),
          storageArea: localStorage,
        })
      );
      response.resolve({ ...paidSession, status: 'expired' });
    });
    expect(onCreated).toHaveBeenCalledWith();
    expect(readPendingConnectorCreation('alice')).toEqual(replacement ?? undefined);
    expect(mockApi.post).not.toHaveBeenCalled();
    expect(toastResponseError).not.toHaveBeenCalled();
  }
);

it('keeps a newer purchase when an old fulfillment response arrives', async () => {
  savePendingConnectorCreation('alice', { ...operation, subscriptionId: 'paid-sub' });
  const response = deferred<{ id: string }>();
  mockApi.post.mockReturnValue(response.promise);
  const { result } = renderCreation();
  const pending = act(async () => {
    const request = result.current.create(SsoProviderName.OIDC);
    savePendingConnectorCreation('alice', { ...operation, key: 'another-purchase' });
    response.resolve({ id: 'old-connector' });
    await request;
  });
  await pending;
  expect(readPendingConnectorCreation('alice')?.key).toBe('another-purchase');
  expect(onCreated).not.toHaveBeenCalledWith('old-connector');
  expect(toastResponseError).not.toHaveBeenCalled();
});

it('waits for fresh allowance instead of choosing personal billing from cached coverage', async () => {
  const cache = new Map([
    [unstable_serialize(['console-sso-coverage', 'alice']), { data: { isAvailable: false } }],
  ]);
  const coverage = deferred<{ logtoEnterprises: Array<{ id: string }> }>();
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return coverage.promise;
    }
    return {
      quotaScope: 'shared',
      quota: { basicQuota: { consoleSsoConnectorLimit: 1 } },
      usages: { consoleSsoConnectorLimit: 0 },
      subscription: { status: 'active' },
    };
  });
  const { result } = renderCreation(cache);
  expect(result.current.billing.isBillingReady).toBe(false);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post).not.toHaveBeenCalled();
  await act(async () => {
    coverage.resolve({ logtoEnterprises: [{ id: 'enterprise-one' }] });
  });
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  expect(result.current.billing.funding).toBe('included');
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(mockApi.post.mock.calls).toEqual([
    ['/api/me/console-sso/connectors', { body: { providerName: SsoProviderName.OIDC } }],
  ]);
});
