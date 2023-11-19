import { SsoProviderName } from '@logto/schemas';

import { isSupportedSsoProvider } from './utils.js';

describe('isSupportedSsoProvider', () => {
  it.each(Object.values(SsoProviderName))('should return true for %s', (providerName) => {
    expect(isSupportedSsoProvider(providerName)).toBe(true);
  });

  it('should return false for unknown provider', () => {
    expect(isSupportedSsoProvider('unknown-provider')).toBe(false);
  });
});
