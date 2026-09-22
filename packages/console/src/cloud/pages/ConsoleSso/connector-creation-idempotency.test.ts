import { SsoProviderName } from '@logto/schemas';

import {
  clearPendingConnectorCreation,
  readPendingConnectorCreation,
  getOrCreatePendingConnectorCreation,
} from './connector-creation-idempotency';

beforeEach(() => {
  localStorage.clear();
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Provide the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn().mockReturnValueOnce('operation-one').mockReturnValueOnce('operation-two'),
  });
});

it('recovers a creation after reload without changing its key or provider', () => {
  const operation = getOrCreatePendingConnectorCreation('alice', SsoProviderName.OIDC);
  expect(readPendingConnectorCreation('alice')).toEqual(operation);
  expect(getOrCreatePendingConnectorCreation('alice', SsoProviderName.SAML)).toEqual(operation);
  expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
});

it('does not share recovery between users', () => {
  getOrCreatePendingConnectorCreation('alice', SsoProviderName.OIDC);
  expect(readPendingConnectorCreation('bob')).toBeUndefined();
});

it('uses a new operation for a deliberate creation after success', () => {
  const first = getOrCreatePendingConnectorCreation('alice', SsoProviderName.OIDC);
  clearPendingConnectorCreation('alice');
  expect(getOrCreatePendingConnectorCreation('alice', SsoProviderName.OIDC).key).not.toBe(
    first.key
  );
});

it('does not send a creation when recovery cannot be persisted', () => {
  const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage is unavailable');
  });
  expect(() => getOrCreatePendingConnectorCreation('alice', SsoProviderName.OIDC)).toThrow(
    'Storage is unavailable'
  );
  setItem.mockRestore();
});

it('allows another provider with a new key after abandoning recovery', () => {
  const first = getOrCreatePendingConnectorCreation('alice', SsoProviderName.OKTA);
  clearPendingConnectorCreation('alice');
  expect(readPendingConnectorCreation('alice')).toBeUndefined();
  const next = getOrCreatePendingConnectorCreation('alice', SsoProviderName.SAML);
  expect(next.providerName).toBe(SsoProviderName.SAML);
  expect(next.key).not.toBe(first.key);
});
