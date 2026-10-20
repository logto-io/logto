import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import type Client from '@withtyped/client';
import { type GuardedResponse, type RouterRoutes } from '@withtyped/client';

import { type LogtoEnterpriseSubscriptionResponse } from '@/cloud/types/router';

import {
  getOrCreatePendingConnectorCreation,
  readPendingConnectorCreation,
  savePendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  abandonConnectorCreation,
  continueConnectorCreation,
  getIncludedCapacity,
  selectCreationFunding,
} from './creation-billing';

const deferred = <T>() => {
  const resolveResponse = jest.fn<void, [T]>();
  const promise = new Promise<T>((resolve) => {
    resolveResponse.mockImplementation(resolve);
  });
  return { promise, resolve: resolveResponse };
};

const api = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const getApi = jest.fn(() => api as unknown as Client<typeof consoleSsoRouter>);
const operation: PendingConnectorCreation = {
  key: 'creation-key',
  providerName: SsoProviderName.OIDC,
  funding: 'personal',
};
const session = {
  status: 'open',
  sessionId: 'session-one',
  providerName: SsoProviderName.OIDC,
  subscriptionId: null,
  redirectUri: 'https://checkout.stripe.com/session-one',
};
const enterprise = (
  limit: NonNullable<
    LogtoEnterpriseSubscriptionResponse['quota']
  >['basicQuota']['consoleSsoConnectorLimit'],
  used: number,
  status = 'active',
  quotaScope = 'shared'
) =>
  ({
    quotaScope,
    quota: { basicQuota: { consoleSsoConnectorLimit: limit } },
    usages: { consoleSsoConnectorLimit: used },
    subscription: { status },
  }) as unknown as LogtoEnterpriseSubscriptionResponse;

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  getApi.mockReturnValue(api as unknown as Client<typeof consoleSsoRouter>);
  api.post.mockResolvedValue({ id: 'connector-one' });
  savePendingConnectorCreation('alice', operation);
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Supply the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn(() => 'new-key'),
  });
});

it.each([
  { limit: 1, used: 0, status: 'active', scope: 'shared', expected: true },
  { limit: 1, used: 1, status: 'active', scope: 'shared', expected: false },
  { limit: 0, used: 0, status: 'active', scope: 'shared', expected: false },
  { limit: null, used: 10, status: 'trialing', scope: 'shared', expected: true },
  { limit: 1, used: 0, status: 'canceled', scope: 'shared', expected: false },
  { limit: 1, used: 0, status: 'active', scope: 'tenant', expected: false },
])(
  'checks contract allowance $limit, usage $used, status $status, scope $scope',
  ({ limit, used, status, scope, expected }) => {
    expect(getIncludedCapacity(enterprise(limit, used, status, scope)).isAvailable).toBe(expected);
  }
);

it('does not infer included capacity from missing Enterprise data', () => {
  expect(getIncludedCapacity().isAvailable).toBe(false);
});

it('preserves funding, provider and subscription when retrying the same intention', () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    subscriptionId: 'original-sub',
  });
  expect(selectCreationFunding('alice', saved, { funding: 'included' })).toEqual(saved);
  expect(getOrCreatePendingConnectorCreation('alice', SsoProviderName.SAML)).toEqual(saved);
});

it('creates an included connector without Checkout or a personal subscription selector', async () => {
  await continueConnectorCreation(
    'alice',
    savePendingConnectorCreation('alice', { ...operation, funding: 'included' }),
    getApi,
    { restartExpired: true }
  );
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC },
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('adds directly to a confirmed subscription, including a zero-quantity subscription', async () => {
  await continueConnectorCreation(
    'alice',
    savePendingConnectorCreation('alice', { ...operation, subscriptionId: 'sub-zero' }),
    getApi,
    { restartExpired: true }
  );
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC, stripeUserSubscriptionId: 'sub-zero' },
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('persists first Checkout before returning its redirect', async () => {
  api.post.mockResolvedValue(session);
  expect(
    await continueConnectorCreation('alice', operation, getApi, { restartExpired: true })
  ).toMatchObject(session);
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    sessionId: session.sessionId,
  });
  expect(getApi).toHaveBeenCalledWith(operation.key);
});

it('replays a lost Checkout response with the same key and provider', async () => {
  savePendingConnectorCreation('alice', operation);
  api.post.mockRejectedValueOnce(new Error('Network failed')).mockResolvedValueOnce(session);
  await expect(
    continueConnectorCreation('alice', operation, getApi, { restartExpired: true })
  ).rejects.toThrow('Network failed');
  await continueConnectorCreation('alice', operation, getApi, { restartExpired: true });
  expect(getApi.mock.calls).toEqual([[operation.key], [operation.key]]);
  expect(api.post.mock.calls[0]).toEqual(api.post.mock.calls[1]);
});

it.each(['open', 'payment_pending'])(
  'does not fulfill an unverified %s payment',
  async (status) => {
    api.get.mockResolvedValue({ ...session, status, subscriptionId: 'unconfirmed-sub' });
    await continueConnectorCreation(
      'alice',
      savePendingConnectorCreation('alice', { ...operation, sessionId: session.sessionId }),
      getApi,
      { restartExpired: false }
    );
    expect(api.post).not.toHaveBeenCalled();
    expect(readPendingConnectorCreation('alice')?.subscriptionId).toBeUndefined();
  }
);

it('rechecks Checkout after a connector lookup fails without creating or purchasing again', async () => {
  const paidSession = { ...session, status: 'payment_received', subscriptionId: 'paid-sub' };
  api.get.mockResolvedValueOnce(paidSession).mockRejectedValueOnce(new Error('Core unavailable'));
  await expect(
    continueConnectorCreation(
      'alice',
      savePendingConnectorCreation('alice', { ...operation, sessionId: session.sessionId }),
      getApi,
      { restartExpired: false }
    )
  ).rejects.toThrow();
  const saved = readPendingConnectorCreation('alice');
  expect(saved).toEqual({ ...operation, sessionId: session.sessionId, subscriptionId: 'paid-sub' });
  if (!saved) {
    throw new Error('Expected recovery');
  }
  api.get.mockResolvedValueOnce(paidSession).mockResolvedValueOnce([
    {
      id: 'connector-one',
      stripeUserSubscriptionId: 'paid-sub',
      providerName: operation.providerName,
    },
  ]);
  await expect(
    continueConnectorCreation('alice', saved, getApi, { restartExpired: true })
  ).resolves.toEqual({
    status: 'created',
    id: undefined,
    operation: saved,
  });
  expect(api.get).toHaveBeenCalledTimes(4);
  expect(api.post).not.toHaveBeenCalled();
});

it('waits for the webhook connector instead of creating a second connector after payment', async () => {
  const paidSession = { ...session, status: 'payment_received', subscriptionId: 'paid-sub' };
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: session.sessionId,
  });
  api.get.mockResolvedValueOnce(paidSession).mockResolvedValueOnce([
    { stripeUserSubscriptionId: 'other-sub', providerName: operation.providerName },
    { stripeUserSubscriptionId: 'paid-sub', providerName: SsoProviderName.SAML },
  ]);
  const result = await continueConnectorCreation('alice', saved, getApi, { restartExpired: false });
  expect(result.status).toBe('payment_pending');
  expect(readPendingConnectorCreation('alice')?.subscriptionId).toBe('paid-sub');
  api.get.mockResolvedValueOnce(paidSession).mockResolvedValueOnce([
    {
      id: 'webhook-connector',
      stripeUserSubscriptionId: 'paid-sub',
      providerName: operation.providerName,
    },
  ]);
  await expect(
    continueConnectorCreation('alice', result.operation, getApi, { restartExpired: false })
  ).resolves.toMatchObject({ status: 'created', id: undefined });
  expect(api.post).not.toHaveBeenCalled();
});

it('recovers an already-paid enrollment response without a frontend connector write', async () => {
  api.post.mockResolvedValue({
    ...session,
    status: 'payment_received',
    subscriptionId: 'paid-sub',
  });
  api.get.mockResolvedValue([
    { stripeUserSubscriptionId: 'paid-sub', providerName: operation.providerName },
  ]);
  await expect(
    continueConnectorCreation('alice', operation, getApi, { restartExpired: true })
  ).resolves.toMatchObject({
    status: 'created',
    id: undefined,
  });
  expect(api.post.mock.calls).toEqual([
    ['/api/me/console-sso/checkout-session', { body: { providerName: operation.providerName } }],
  ]);
});

it('persists the subscription selected by Checkout reuse without a session', async () => {
  api.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'reused-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  await continueConnectorCreation('alice', operation, getApi, { restartExpired: true });
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    subscriptionId: 'reused-sub',
  });
});

it('does not reopen an expired payment during polling', async () => {
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  await continueConnectorCreation(
    'alice',
    savePendingConnectorCreation('alice', { ...operation, sessionId: session.sessionId }),
    getApi,
    { restartExpired: false }
  );
  expect(api.post).not.toHaveBeenCalled();
});

it('restarts a verified unpaid expiry with a fresh payment key and unchanged creation key', async () => {
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  api.post.mockResolvedValueOnce({ ...session, sessionId: 'session-two' });
  await continueConnectorCreation(
    'alice',
    savePendingConnectorCreation('alice', { ...operation, sessionId: session.sessionId }),
    getApi,
    { restartExpired: true }
  );
  expect(getApi).toHaveBeenLastCalledWith('new-key');
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    checkoutKey: 'new-key',
    sessionId: 'session-two',
  });
});

it('retains the new payment key when the replacement Checkout response is lost', async () => {
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  api.post.mockRejectedValueOnce(new Error('Network failed'));
  await expect(
    continueConnectorCreation(
      'alice',
      savePendingConnectorCreation('alice', { ...operation, sessionId: session.sessionId }),
      getApi,
      { restartExpired: true }
    )
  ).rejects.toThrow();
  expect(readPendingConnectorCreation('alice')).toEqual({ ...operation, checkoutKey: 'new-key' });
});

it('recovers and expires a lost Checkout before abandoning its key', async () => {
  savePendingConnectorCreation('alice', operation);
  api.post.mockResolvedValue(session);
  api.delete.mockResolvedValueOnce({ ...session, status: 'expired' });
  await expect(abandonConnectorCreation('alice', operation, getApi)).resolves.toEqual({
    status: 'abandoned',
  });
  expect(api.delete.mock.calls).toEqual([
    [
      '/api/me/console-sso/checkout-session/:sessionId',
      { params: { sessionId: session.sessionId } },
    ],
    ['/api/me/console-sso/connector-creation'],
  ]);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('keeps pending payment recovery when cancellation races with payment', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: session.sessionId,
  });
  api.delete.mockResolvedValue({ ...session, status: 'payment_pending' });
  await expect(abandonConnectorCreation('alice', saved, getApi)).resolves.toMatchObject({
    status: 'payment_pending',
  });
  expect(api.delete).toHaveBeenCalledTimes(1);
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
});

it('allows deliberate repurchase after an unusable subscription without rewriting its old intention', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    subscriptionId: 'canceled-sub',
  });
  api.post.mockRejectedValueOnce(new Error('Subscription not usable'));
  await expect(
    continueConnectorCreation('alice', saved, getApi, { restartExpired: true })
  ).rejects.toThrow();
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  await abandonConnectorCreation('alice', saved, getApi);
  expect(getOrCreatePendingConnectorCreation('alice', SsoProviderName.SAML)).toEqual({
    key: 'new-key',
    providerName: SsoProviderName.SAML,
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it.each(['expired', 'open', 'payment_pending', 'payment_received'] as const)(
  'ignores a stale %s poll after another tab replaces the purchase',
  async (status) => {
    const saved = savePendingConnectorCreation('alice', {
      ...operation,
      sessionId: session.sessionId,
    });
    const response =
      deferred<
        GuardedResponse<
          RouterRoutes<
            typeof consoleSsoRouter
          >['get']['/api/me/console-sso/checkout-session/:sessionId']
        >
      >();
    api.get.mockReturnValue(response.promise);
    const pending = continueConnectorCreation('alice', saved, getApi, { restartExpired: false });
    const replacement = savePendingConnectorCreation('alice', {
      ...operation,
      key: 'another-purchase',
      sessionId: 'another-session',
    });
    response.resolve({ ...session, status, subscriptionId: 'paid-sub' });
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(readPendingConnectorCreation('alice')).toEqual(replacement);
    expect(api.post).not.toHaveBeenCalled();
  }
);

it('ignores a stale poll when the same creation has a newer payment attempt', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    sessionId: session.sessionId,
  });
  const response = deferred<typeof session>();
  api.get.mockReturnValue(response.promise);
  const pending = continueConnectorCreation('alice', saved, getApi, { restartExpired: false });
  const replacement = savePendingConnectorCreation('alice', {
    ...saved,
    checkoutKey: 'new-checkout',
    sessionId: 'new-session',
  });
  response.resolve({ ...session, status: 'expired' });
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(readPendingConnectorCreation('alice')).toEqual(replacement);
});

it('does not save a stale enrollment response over a new purchase', async () => {
  const response = deferred<typeof session>();
  api.post.mockReturnValue(response.promise);
  const pending = continueConnectorCreation('alice', operation, getApi, { restartExpired: true });
  const replacement = savePendingConnectorCreation('alice', {
    ...operation,
    key: 'another-purchase',
  });
  response.resolve(session);
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(readPendingConnectorCreation('alice')).toEqual(replacement);
});

it('does not clear a new purchase when an old cleanup finishes', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    subscriptionId: 'paid-sub',
  });
  const response = deferred<void>();
  api.delete.mockReturnValue(response.promise);
  const pending = abandonConnectorCreation('alice', saved, getApi);
  // Allow the session settlement step to finish before replacing the cleanup's operation.
  await Promise.resolve();
  expect(api.delete).toHaveBeenCalledWith('/api/me/console-sso/connector-creation');
  const replacement = savePendingConnectorCreation('alice', {
    ...operation,
    key: 'another-purchase',
  });
  response.resolve();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(readPendingConnectorCreation('alice')).toEqual(replacement);
});
