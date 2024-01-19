import { pickDefault } from '@logto/shared/esm';

import { mockProtectedAppConfigProviderConfig } from '#src/__mocks__/index.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

await mockIdGenerators();

const tenantContext = new MockTenant(undefined, undefined, undefined, {
  quota: createMockQuotaLibrary(),
  protectedApps: {
    getDefaultDomain: jest.fn(async () => mockProtectedAppConfigProviderConfig.domain),
  },
});

const { createRequester } = await import('#src/utils/test-utils.js');
const systemRoutes = await pickDefault(import('./system.js'));

describe('system route', () => {
  const systemRequest = createRequester({ authedRoutes: systemRoutes, tenantContext });

  it('GET /systems/application', async () => {
    const response = await systemRequest.get('/systems/application');
    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({
      protectedApps: { defaultDomain: mockProtectedAppConfigProviderConfig.domain },
    });
  });
});
