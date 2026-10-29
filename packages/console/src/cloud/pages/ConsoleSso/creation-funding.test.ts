import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import type Client from '@withtyped/client';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import { abandonConnectorCreation, continueConnectorCreation } from './creation-billing';

// Jest's CommonJS resolver needs a virtual module for the ESM-only client package.
jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ tryReadResponseErrorBody: jest.fn() }));

const chooseBillingCustomer = jest.fn(async () => ({}));
const api = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
const getApi = jest.fn(() => api as unknown as Client<typeof consoleSsoRouter>);
const operation: PendingConnectorCreation = {
  key: 'creation-key',
  providerName: SsoProviderName.OIDC,
  funding: 'personal',
};

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  api.post.mockResolvedValue({ id: 'connector-one' });
  savePendingConnectorCreation('alice', operation);
});

it('creates a new intention with its persisted idempotency key', async () => {
  const saved = savePendingConnectorCreation('alice', {
    key: operation.key,
    providerName: operation.providerName,
  });
  await expect(
    continueConnectorCreation('alice', saved, getApi, {
      restartExpired: true,
      chooseBillingCustomer,
    })
  ).resolves.toMatchObject({ status: 'created', id: 'connector-one' });
  expect(getApi).toHaveBeenCalledTimes(1);
  expect(getApi).toHaveBeenCalledWith(operation.key);
  expect(api.post).toHaveBeenCalledWith('/api/me/console-sso/connectors', {
    body: { providerName: operation.providerName },
  });
  expect(chooseBillingCustomer).not.toHaveBeenCalled();
});

it('keeps legacy included recovery for explicit cleanup instead of guessing its Enterprise', async () => {
  const saved = savePendingConnectorCreation('alice', { ...operation, funding: 'included' });
  await expect(
    continueConnectorCreation('alice', saved, getApi, {
      restartExpired: true,
      chooseBillingCustomer,
    })
  ).rejects.toThrow('Unable to resume this creation. Start over to continue.');
  expect(api.post).not.toHaveBeenCalled();
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  await abandonConnectorCreation('alice', saved, getApi);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('does not start a new Checkout when a saved personal subscription cannot create', async () => {
  const saved = savePendingConnectorCreation('alice', { ...operation, subscriptionId: 'paid-sub' });
  api.post.mockResolvedValueOnce({ status: 'checkout_required' });
  await expect(
    continueConnectorCreation('alice', saved, getApi, {
      restartExpired: true,
      chooseBillingCustomer,
    })
  ).rejects.toThrow('Unable to resume this creation. Start over to continue.');
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(chooseBillingCustomer).not.toHaveBeenCalled();
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
});

it('replays a lost Enterprise creation response with the same funding and creation key', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    funding: 'included',
    enterpriseId: 'enterprise-one',
  });
  api.post.mockRejectedValueOnce(new Error('Network failed'));
  await expect(
    continueConnectorCreation('alice', saved, getApi, {
      restartExpired: true,
      chooseBillingCustomer,
    })
  ).rejects.toThrow('Network failed');
  const recovered = readPendingConnectorCreation('alice');
  expect(recovered).toEqual(saved);
  if (!recovered) {
    throw new Error('Expected recovery');
  }
  await continueConnectorCreation('alice', recovered, getApi, {
    restartExpired: true,
    chooseBillingCustomer,
  });
  expect(getApi.mock.calls).toEqual([[saved.key], [saved.key]]);
  expect(api.post.mock.calls).toEqual(
    Array.from({ length: 2 }, () => [
      '/api/me/logto-enterprises/:id/console-sso/connectors',
      { params: { id: saved.enterpriseId }, body: { providerName: saved.providerName } },
    ])
  );
});
