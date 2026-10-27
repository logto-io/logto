import { SsoProviderName } from '@logto/schemas';
import { act, waitFor } from '@testing-library/react';

import { readPendingConnectorCreation } from './connector-creation-idempotency';
import {
  mockApi,
  mockChooseBillingCustomer,
  onCreated,
  renderCreation,
  renderCreationWithSwr,
  toastResponseError,
} from './use-connector-creation.test-helpers';

const deferred = <T>() => {
  const resolveResponse = jest.fn<void, [T]>();
  const promise = new Promise<T>((resolve) => {
    resolveResponse.mockImplementation(resolve);
  });
  return { promise, resolve: resolveResponse };
};

const enterprise = (isAvailable: boolean) => ({
  quotaScope: 'shared',
  quota: { basicQuota: { consoleSsoConnectorLimit: 1 } },
  usages: { consoleSsoConnectorLimit: isAvailable ? 0 : 1 },
  subscription: { status: 'active' },
});

it('uses personal billing when the latest Enterprise allowance is exhausted', async () => {
  mockApi.get.mockImplementation(async (path: string) => {
    if (path === '/api/me/logto-enterprises') {
      return { logtoEnterprises: [{ id: 'enterprise-one' }] };
    }
    return enterprise(true);
  });
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.funding).toBe('included');
  });
  mockApi.get
    .mockResolvedValueOnce({ logtoEnterprises: [{ id: 'enterprise-one' }] })
    .mockResolvedValueOnce(enterprise(false));
  mockApi.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'personal-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
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

it('waits for submission coverage even if an older background refresh finishes first', async () => {
  const { result } = renderCreationWithSwr();
  await waitFor(() => {
    expect(result.current.creation.billing.isBillingReady).toBe(true);
  });
  const background = deferred<{ logtoEnterprises: Array<{ id: string }> }>();
  const submission = deferred<{ logtoEnterprises: Array<{ id: string }> }>();
  mockApi.get
    .mockResolvedValueOnce(background.promise)
    .mockResolvedValueOnce(submission.promise)
    .mockResolvedValue(enterprise(true));
  act(() => {
    void result.current.swr.mutate(['console-sso-coverage', 'alice']);
  });
  await act(async () => {
    void result.current.creation.create(SsoProviderName.OIDC);
  });
  await act(async () => {
    background.resolve({ logtoEnterprises: [] });
  });
  expect(result.current.creation.isSubmitting).toBe(true);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(mockApi.post).not.toHaveBeenCalled();
  await act(async () => {
    submission.resolve({ logtoEnterprises: [{ id: 'enterprise-one' }] });
  });
  await waitFor(() => {
    expect(onCreated).toHaveBeenCalledWith('connector-one');
  });
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  expect(mockApi.post).toHaveBeenCalledWith(
    '/api/me/logto-enterprises/:id/console-sso/connectors',
    { params: { id: 'enterprise-one' }, body: { providerName: SsoProviderName.OIDC } }
  );
});

it('allows retry after submission coverage fails without saving a funding decision', async () => {
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  const failure = new Error('Coverage unavailable');
  mockApi.get.mockRejectedValueOnce(failure);
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(toastResponseError).toHaveBeenCalledWith(failure);
  expect(result.current.isSubmitting).toBe(false);
  expect(result.current.billing.isBillingReady).toBe(true);
  expect(result.current.billing.billingError).toBeUndefined();
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(mockApi.post).not.toHaveBeenCalled();
  expect(mockChooseBillingCustomer).not.toHaveBeenCalled();
  mockApi.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'personal-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  await act(async () => {
    await result.current.create(SsoProviderName.OIDC);
  });
  expect(onCreated).toHaveBeenCalledWith('connector-one');
});

it('keeps cached coverage ready after a failed background refresh', async () => {
  const { result } = renderCreationWithSwr();
  await waitFor(() => {
    expect(result.current.creation.billing.isBillingReady).toBe(true);
  });
  mockApi.get.mockRejectedValueOnce(new Error('Background refresh failed'));
  await act(async () => {
    await result.current.swr.mutate(['console-sso-coverage', 'alice']);
  });
  expect(result.current.creation.billing.billingError).toBeUndefined();
  expect(result.current.creation.billing.isBillingReady).toBe(true);
  expect(result.current.creation.isSubmitting).toBe(false);
  mockApi.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'personal-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  await act(async () => {
    await result.current.creation.create(SsoProviderName.OIDC);
  });
  expect(onCreated).toHaveBeenCalledWith('connector-one');
});

it('serializes repeated clicks while checking submission coverage', async () => {
  const { result } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  const coverage = deferred<{ logtoEnterprises: Array<{ id: string }> }>();
  mockApi.get.mockClear().mockResolvedValueOnce(coverage.promise);
  mockApi.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'personal-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  await act(async () => {
    void result.current.create(SsoProviderName.OIDC);
    void result.current.create(SsoProviderName.SAML);
  });
  expect(result.current.isSubmitting).toBe(true);
  expect(mockApi.get).toHaveBeenCalledTimes(1);
  expect(mockApi.post).not.toHaveBeenCalled();
  await act(async () => {
    coverage.resolve({ logtoEnterprises: [] });
  });
  await waitFor(() => {
    expect(onCreated).toHaveBeenCalledWith('connector-one');
  });
  expect(mockApi.post).toHaveBeenCalledTimes(2);
  expect(mockApi.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC, stripeUserSubscriptionId: 'personal-sub' },
  });
});

it('does not start creation if the modal unmounts during submission coverage validation', async () => {
  const { result, unmount } = renderCreation();
  await waitFor(() => {
    expect(result.current.billing.isBillingReady).toBe(true);
  });
  const coverage = deferred<{ logtoEnterprises: Array<{ id: string }> }>();
  mockApi.get.mockResolvedValueOnce(coverage.promise);
  await act(async () => {
    void result.current.create(SsoProviderName.OIDC);
  });
  unmount();
  await act(async () => {
    coverage.resolve({ logtoEnterprises: [] });
  });
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  expect(mockApi.post).not.toHaveBeenCalled();
  expect(mockChooseBillingCustomer).not.toHaveBeenCalled();
  expect(onCreated).not.toHaveBeenCalled();
});
