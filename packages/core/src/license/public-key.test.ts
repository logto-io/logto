import { getLicensePublicKey } from './public-key.js';

describe('getLicensePublicKey()', () => {
  it('should trust no key while the release has none built in', async () => {
    await expect(getLicensePublicKey()).resolves.toBeUndefined();
  });
});
