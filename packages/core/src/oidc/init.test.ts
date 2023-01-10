import { MockQueries } from '#src/test-utils/tenant.js';

import initOidc from './init.js';

describe('oidc provider init', () => {
  it('init should not throw', async () => {
    expect(() => initOidc(new MockQueries())).not.toThrow();
  });
});
