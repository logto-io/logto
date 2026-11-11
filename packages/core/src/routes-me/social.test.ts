import { pickDefault } from '@logto/shared/esm';

import { mockGoogleConnector, mockSignInExperience, mockUser } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockedQueries = {
  signInExperiences: {
    findDefaultSignInExperience: jest.fn(async () => ({
      ...mockSignInExperience,
      socialSignInConnectorTargets: ['google'],
    })),
  },
} satisfies Partial2<Queries>;

const meSocialRoutes = await pickDefault(import('./social.js'));

describe('me social routes', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, {
    getLogtoConnectors: jest.fn(async () => [mockGoogleConnector]),
  });
  const meRequest = createRequester({
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = { ...ctx.auth, id: mockUser.id };

          return next();
        });
      },
      meSocialRoutes as never,
    ],
    tenantContext,
  });

  it('GET /social/connectors omits connector config', async () => {
    const response = await meRequest.get('/social/connectors');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({ id: mockGoogleConnector.dbEntry.id, target: 'google' }),
    ]);
    expect(response.body[0]).not.toHaveProperty('config');
  });
});
