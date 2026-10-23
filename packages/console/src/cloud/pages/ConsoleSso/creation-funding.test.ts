import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderName } from '@logto/schemas';
import type Client from '@withtyped/client';

import {
  readPendingConnectorCreation,
  savePendingConnectorCreation,
  type PendingConnectorCreation,
} from './connector-creation-idempotency';
import {
  abandonConnectorCreation,
  continueConnectorCreation,
  selectCreationFunding,
} from './creation-billing';

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

it('persists the funding Enterprise without changing it on a later selection', () => {
  const unfunded = { key: 'creation-key', providerName: SsoProviderName.OIDC };
  const saved = selectCreationFunding('alice', unfunded, {
    funding: 'included',
    enterpriseId: 'enterprise-one',
  });
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  expect(
    selectCreationFunding('alice', saved, { funding: 'included', enterpriseId: 'enterprise-two' })
  ).toEqual(saved);
  expect(selectCreationFunding('alice', saved, { funding: 'personal' })).toEqual(saved);
});

it('requires an Enterprise selector before persisting a new included selection', () => {
  expect(() =>
    selectCreationFunding(
      'alice',
      { key: 'new-key', providerName: SsoProviderName.OIDC },
      { funding: 'included' }
    )
  ).toThrow('Select an Enterprise');
  expect(readPendingConnectorCreation('alice')).toEqual(operation);
});

it('keeps legacy included recovery for explicit cleanup instead of guessing its Enterprise', async () => {
  const saved = savePendingConnectorCreation('alice', { ...operation, funding: 'included' });
  await expect(
    continueConnectorCreation('alice', saved, getApi, { restartExpired: true })
  ).rejects.toThrow('Start over');
  expect(api.post).not.toHaveBeenCalled();
  expect(readPendingConnectorCreation('alice')).toEqual(saved);
  await abandonConnectorCreation('alice', saved, getApi);
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
});

it('replays a lost Enterprise creation response with the same funding and creation key', async () => {
  const saved = savePendingConnectorCreation('alice', {
    ...operation,
    funding: 'included',
    enterpriseId: 'enterprise-one',
  });
  api.post.mockRejectedValueOnce(new Error('Network failed'));
  await expect(
    continueConnectorCreation('alice', saved, getApi, { restartExpired: true })
  ).rejects.toThrow('Network failed');
  const recovered = readPendingConnectorCreation('alice');
  expect(recovered).toEqual(saved);
  if (!recovered) {
    throw new Error('Expected recovery');
  }
  await continueConnectorCreation('alice', recovered, getApi, { restartExpired: true });
  expect(getApi.mock.calls).toEqual([[saved.key], [saved.key]]);
  expect(api.post.mock.calls).toEqual(
    Array.from({ length: 2 }, () => [
      '/api/me/logto-enterprises/:id/console-sso/connectors',
      { params: { id: saved.enterpriseId }, body: { providerName: saved.providerName } },
    ])
  );
});
