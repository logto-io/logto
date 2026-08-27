import { getCimdConfig, updateCimdConfig } from '#src/api/logto-config.js';
import { expectRejects } from '#src/helpers/index.js';

describe('CIMD config', () => {
  afterAll(async () => {
    // Leave the tenant with the default-off state so other suites see a clean provider config.
    await updateCimdConfig({ enabled: false });
  });

  it('should resolve a missing config row to the disabled state', async () => {
    await expect(getCimdConfig()).resolves.toEqual({ enabled: false });
  });

  it('should reject enabling while an SSRF allowlist is configured', async () => {
    // The API integration environment allowlists loopback for webhook/backchannel mocks, which
    // disables CIMD so unauthenticated client_id URLs cannot inherit those destinations.
    await expectRejects(updateCimdConfig({ enabled: true }), {
      code: 'request.invalid_input',
      status: 422,
    });
  });

  it('should still accept a no-op or disable patch while the feature stays off', async () => {
    await expect(getCimdConfig()).resolves.toEqual({ enabled: false });
    await expect(updateCimdConfig({})).resolves.toEqual({ enabled: false });
    await expect(updateCimdConfig({ enabled: false })).resolves.toEqual({ enabled: false });
  });
});
