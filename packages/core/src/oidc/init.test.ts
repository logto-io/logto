import { EnvSet } from '#src/env-set/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    const { queries, libraries } = new MockTenant();

    expect(() => initOidc(EnvSet.default, queries, libraries)).not.toThrow();
  });
});
