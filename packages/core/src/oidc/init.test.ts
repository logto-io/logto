import { mockEnvSet } from '#src/test-utils/env-set.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    const { id, queries, libraries, logtoConfigs, cloudConnection, subscription } =
      new MockTenant();

    expect(() =>
      initOidc(id, mockEnvSet, queries, libraries, logtoConfigs, cloudConnection, subscription)
    ).not.toThrow();
  });
});
