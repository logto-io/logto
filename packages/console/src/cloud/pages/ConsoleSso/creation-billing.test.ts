import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import type Client from '@withtyped/client';

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
  await continueConnectorCreation('alice', { ...operation, funding: 'included' }, getApi, true);
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC },
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('adds directly to a confirmed subscription, including a zero-quantity subscription', async () => {
  await continueConnectorCreation(
    'alice',
    { ...operation, subscriptionId: 'sub-zero' },
    getApi,
    true
  );
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: SsoProviderName.OIDC, stripeUserSubscriptionId: 'sub-zero' },
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});

it('persists first Checkout before returning its redirect', async () => {
  api.post.mockResolvedValue(session);
  expect(await continueConnectorCreation('alice', operation, getApi, true)).toEqual(session);
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    sessionId: session.sessionId,
  });
  expect(getApi).toHaveBeenCalledWith(operation.key);
});

it('replays a lost Checkout response with the same key and provider', async () => {
  savePendingConnectorCreation('alice', operation);
  api.post.mockRejectedValueOnce(new Error('Network failed')).mockResolvedValueOnce(session);
  await expect(continueConnectorCreation('alice', operation, getApi, true)).rejects.toThrow(
    'Network failed'
  );
  await continueConnectorCreation('alice', operation, getApi, true);
  expect(getApi.mock.calls).toEqual([[operation.key], [operation.key]]);
  expect(api.post.mock.calls[0]).toEqual(api.post.mock.calls[1]);
});

it.each(['open', 'payment_pending'])(
  'does not fulfill an unverified %s payment',
  async (status) => {
    api.get.mockResolvedValue({ ...session, status, subscriptionId: 'unconfirmed-sub' });
    await continueConnectorCreation(
      'alice',
      { ...operation, sessionId: session.sessionId },
      getApi,
      false
    );
    expect(api.post).not.toHaveBeenCalled();
    expect(readPendingConnectorCreation('alice')?.subscriptionId).toBeUndefined();
  }
);

it('keeps the verified subscription when fulfillment fails and retries without Checkout', async () => {
  api.get.mockResolvedValue({ ...session, status: 'payment_received', subscriptionId: 'paid-sub' });
  api.post
    .mockRejectedValueOnce(new Error('Core unavailable'))
    .mockResolvedValueOnce({ id: 'connector-one' });
  await expect(
    continueConnectorCreation(
      'alice',
      { ...operation, sessionId: session.sessionId },
      getApi,
      false
    )
  ).rejects.toThrow();
  const saved = readPendingConnectorCreation('alice');
  expect(saved).toEqual({ ...operation, sessionId: session.sessionId, subscriptionId: 'paid-sub' });
  if (!saved) {
    throw new Error('Expected recovery');
  }
  await expect(continueConnectorCreation('alice', saved, getApi, true)).resolves.toEqual({
    status: 'created',
    id: 'connector-one',
  });
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.post.mock.calls.every(([path]) => path === '/api/me/console-sso/connectors')).toBe(
    true
  );
});

it('persists the subscription selected by Checkout reuse without a session', async () => {
  api.post
    .mockResolvedValueOnce({ status: 'subscription_exists', subscriptionId: 'reused-sub' })
    .mockResolvedValueOnce({ id: 'connector-one' });
  await continueConnectorCreation('alice', operation, getApi, true);
  expect(readPendingConnectorCreation('alice')).toEqual({
    ...operation,
    subscriptionId: 'reused-sub',
  });
});

it('does not reopen an expired payment during polling', async () => {
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  await continueConnectorCreation(
    'alice',
    { ...operation, sessionId: session.sessionId },
    getApi,
    false
  );
  expect(api.post).not.toHaveBeenCalled();
});

it('restarts a verified unpaid expiry with a fresh payment key and unchanged creation key', async () => {
  api.get.mockResolvedValue({ ...session, status: 'expired' });
  api.post.mockResolvedValueOnce({ ...session, sessionId: 'session-two' });
  await continueConnectorCreation(
    'alice',
    { ...operation, sessionId: session.sessionId },
    getApi,
    true
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
    continueConnectorCreation('alice', { ...operation, sessionId: session.sessionId }, getApi, true)
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
  await expect(continueConnectorCreation('alice', saved, getApi, true)).rejects.toThrow();
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  await abandonConnectorCreation('alice', saved, getApi);
  expect(getOrCreatePendingConnectorCreation('alice', SsoProviderName.SAML)).toEqual({
    key: 'new-key',
    providerName: SsoProviderName.SAML,
  });
  expect(api.post).toHaveBeenCalledTimes(1);
});
