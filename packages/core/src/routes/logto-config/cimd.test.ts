import { defaultCimdConfig, type CimdConfig } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const logtoConfigQueries = {
  getCimdConfig: jest.fn(async (): Promise<CimdConfig> => defaultCimdConfig),
  upsertCimdConfig: jest.fn(),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('CIMD config routes', () => {
  const tenantContext = new MockTenant(undefined, { logtoConfigs: logtoConfigQueries });

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });

  const originalSsrfProtectionEnabled = EnvSet.values.isOidcProviderSsrfProtectionEnabled;

  afterEach(() => {
    jest.clearAllMocks();
    Reflect.set(
      EnvSet.values,
      'isOidcProviderSsrfProtectionEnabled',
      originalSsrfProtectionEnabled
    );
  });

  describe('GET /configs/cimd', () => {
    it('resolves a missing config row to the disabled state', async () => {
      const response = await routeRequester.get('/configs/cimd');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ enabled: false });
    });

    it('returns the stored config', async () => {
      logtoConfigQueries.getCimdConfig.mockResolvedValueOnce({ enabled: true });

      const response = await routeRequester.get('/configs/cimd');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ enabled: true });
    });
  });

  describe('PATCH /configs/cimd', () => {
    it('merges the patch onto the current config and upserts the whole object', async () => {
      const response = await routeRequester.patch('/configs/cimd').send({ enabled: true });

      expect(response.status).toEqual(200);
      expect(logtoConfigQueries.upsertCimdConfig).toHaveBeenCalledWith({ enabled: true });
      expect(response.body).toEqual({ enabled: true });
    });

    it('rejects enabling with 422 while the SSRF protection is disabled', async () => {
      Reflect.set(EnvSet.values, 'isOidcProviderSsrfProtectionEnabled', false);

      const response = await routeRequester.patch('/configs/cimd').send({ enabled: true });

      expect(response.status).toEqual(422);
      expect(logtoConfigQueries.upsertCimdConfig).not.toHaveBeenCalled();
    });

    it('allows disabling while the SSRF protection is disabled', async () => {
      Reflect.set(EnvSet.values, 'isOidcProviderSsrfProtectionEnabled', false);
      logtoConfigQueries.getCimdConfig.mockResolvedValueOnce({ enabled: true });

      const response = await routeRequester.patch('/configs/cimd').send({ enabled: false });

      expect(response.status).toEqual(200);
      expect(logtoConfigQueries.upsertCimdConfig).toHaveBeenCalledWith({ enabled: false });
    });
  });
});
