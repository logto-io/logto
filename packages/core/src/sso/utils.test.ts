import { SsoProviderName } from '#src/sso/types/index.js';

import { isSupportedSsoProvider } from './utils.js';

describe('isSupportedSsoProvider', () => {
  it.each(Object.values(SsoProviderName))('should return true for %s', (providerName) => {
    expect(isSupportedSsoProvider(providerName)).toBe(true);
  });

  it('should return false for unknown provider', () => {
    expect(isSupportedSsoProvider('unknown-provider')).toBe(false);
  });
});
