import { SsoProviderName } from '@logto/schemas';

import { finishCreation, readCreation, startCreation } from './creation';

beforeEach(() => {
  localStorage.clear();
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- Provide the browser UUID API in jsdom.
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: jest.fn().mockReturnValueOnce('operation-one').mockReturnValueOnce('operation-two'),
  });
});

it('recovers a creation after reload without changing its key or provider', () => {
  const operation = startCreation('alice', 'customer-a', SsoProviderName.OIDC);
  expect(readCreation('alice', 'customer-a')).toEqual(operation);
  expect(startCreation('alice', 'customer-a', SsoProviderName.SAML)).toEqual(operation);
  expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
});

it('does not share recovery between users or customers', () => {
  startCreation('alice', 'customer-a', SsoProviderName.OIDC);
  expect(readCreation('bob', 'customer-a')).toBeUndefined();
  expect(readCreation('alice', 'customer-b')).toBeUndefined();
});

it('uses a new operation for a deliberate creation after success', () => {
  const first = startCreation('alice', 'customer-a', SsoProviderName.OIDC);
  finishCreation('alice', 'customer-a');
  expect(startCreation('alice', 'customer-a', SsoProviderName.OIDC).key).not.toBe(first.key);
});

it('does not send a creation when recovery cannot be persisted', () => {
  const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage is unavailable');
  });
  expect(() => startCreation('alice', 'customer-a', SsoProviderName.OIDC)).toThrow(
    'Storage is unavailable'
  );
  setItem.mockRestore();
});
