import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const findCaseConflicts = jest.fn();

// The conflict-detection route is only registered when dev features are enabled, so mock EnvSet
// with the flag on before importing the routes.
await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    values: {
      isDevFeaturesEnabled: true,
      isCloud: false,
      isProduction: false,
      isUnitTest: true,
    },
  },
}));

const signInExperiencesRoutes = await pickDefault(import('./index.js'));

describe('GET /sign-in-exp/username-policy/case-sensitivity-conflicts', () => {
  const requester = createRequester({
    authedRoutes: signInExperiencesRoutes,
    tenantContext: new MockTenant(undefined, undefined, undefined, {
      signInExperiences: { findCaseConflicts },
    }),
  });

  afterEach(() => {
    findCaseConflicts.mockReset();
  });

  it('returns the conflict count and samples', async () => {
    findCaseConflicts.mockResolvedValueOnce({
      totalConflicts: 2,
      samples: [{ usernameLower: 'foo', userIds: ['u1', 'u2'] }],
    });

    const response = await requester.get('/sign-in-exp/username-policy/case-sensitivity-conflicts');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      totalConflicts: 2,
      samples: [{ usernameLower: 'foo', userIds: ['u1', 'u2'] }],
    });
    expect(findCaseConflicts).toHaveBeenCalledWith(20);
  });

  it('forwards the limit query to the library', async () => {
    findCaseConflicts.mockResolvedValueOnce({ totalConflicts: 0, samples: [] });

    await requester.get('/sign-in-exp/username-policy/case-sensitivity-conflicts?limit=5');

    expect(findCaseConflicts).toHaveBeenCalledWith(5);
  });
});
