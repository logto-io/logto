import { mockEnvSet } from '#src/test-utils/env-set.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    const { queries, libraries } = new MockTenant();

    expect(() => initOidc(mockEnvSet, queries, libraries)).not.toThrow();
  });
});
