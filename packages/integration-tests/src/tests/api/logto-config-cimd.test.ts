import { authedAdminApi } from '#src/api/api.js';
import { getCimdConfig, updateCimdConfig } from '#src/api/logto-config.js';
import { devFeatureDisabledTest, devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('CIMD config', () => {
  afterAll(async () => {
    // Leave the tenant with the default-off state so other suites see a clean provider config.
    await updateCimdConfig({ enabled: false });
  });

  it('should resolve a missing config row to the disabled state', async () => {
    await expect(getCimdConfig()).resolves.toEqual({ enabled: false });
  });

  it('should enable and disable the feature via merge + upsert', async () => {
    // The API integration test environment keeps the SSRF protection on, so enabling passes.
    await expect(updateCimdConfig({ enabled: true })).resolves.toEqual({ enabled: true });

    await expect(getCimdConfig()).resolves.toEqual({ enabled: true });

    await expect(updateCimdConfig({})).resolves.toEqual({ enabled: true });

    await expect(updateCimdConfig({ enabled: false })).resolves.toEqual({ enabled: false });
  });
});

devFeatureDisabledTest.describe('CIMD config routes when dev features are disabled', () => {
  it('should not expose the CIMD config routes', async () => {
    const response = await authedAdminApi.get('configs/cimd', { throwHttpErrors: false });

    expect(response.status).toBe(404);
  });
});
