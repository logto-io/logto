import { internalPrefix } from '@logto/schemas';

import { mockApplication } from '#src/__mocks__/index.js';

import { omitInternalApplicationSecret } from './application-response.js';

describe('omitInternalApplicationSecret', () => {
  it('omits an internal secret', () => {
    expect(
      omitInternalApplicationSecret({
        ...mockApplication,
        secret: `${internalPrefix}secret`,
      })
    ).not.toHaveProperty('secret');
  });

  it('preserves a legacy secret', () => {
    expect(
      omitInternalApplicationSecret({
        ...mockApplication,
        secret: 'legacy-secret',
      })
    ).toMatchObject({ secret: 'legacy-secret' });
  });
});
