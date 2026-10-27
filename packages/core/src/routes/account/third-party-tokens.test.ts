import { UserScope } from '@logto/core-kit';
import { pickDefault } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const assertFirstPartyClient = jest.fn(async () => true);
jest.unstable_mockModule('#src/utils/assert-first-party-client.js', () => ({
  assertFirstPartyClient,
}));

const rejectAsThirdParty = () => {
  assertFirstPartyClient.mockRejectedValueOnce(
    new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 })
  );
};

const findSocialTokenSetSecretByUserIdAndTarget = jest.fn(async () => null);
const findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId = jest.fn(async () => null);

const mockedQueries = {
  secrets: {
    findSocialTokenSetSecretByUserIdAndTarget,
    findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId,
  },
  users: {
    findUserByIdentity: jest.fn(),
  },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  socials: {
    upsertSocialTokenSetSecret: jest.fn(),
  },
} satisfies Partial2<Libraries>;

const thirdPartyTokensRoutes = await pickDefault(import('./third-party-tokens.js'));

describe('account third-party token route authorization', () => {
  const tenantContext = new MockTenant(undefined, mockedQueries, undefined, mockedLibraries);

  const buildRequester = (scopes: Set<string>, clientId?: string) =>
    createRequester({
      middlewares: [koaI18next(), koaErrorHandler()],
      authedRoutes: [
        (router) => {
          router.use(async (ctx, next) => {
            ctx.auth = { ...ctx.auth, id: mockUser.id, identityVerified: true, scopes, clientId };
            return next();
          });
        },
        thirdPartyTokensRoutes as never,
      ],
      tenantContext,
    });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('without the identities scope (openid only)', () => {
    const request = buildRequester(new Set(['openid']));

    it('rejects GET social access-token and does not read the stored secret', async () => {
      const response = await request.get('/my-account/identities/google/access-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.forbidden');
      expect(findSocialTokenSetSecretByUserIdAndTarget).not.toHaveBeenCalled();
    });

    it('rejects GET enterprise SSO access-token and does not read the stored secret', async () => {
      const response = await request.get('/my-account/sso-identities/sso-conn/access-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.forbidden');
      expect(findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId).not.toHaveBeenCalled();
    });

    it('rejects PUT social access-token before any verification work', async () => {
      const response = await request
        .put('/my-account/identities/google/access-token')
        .send({ verificationRecordId: 'mock-verification-record-id' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.forbidden');
    });
  });

  describe('with the identities scope', () => {
    const request = buildRequester(new Set(['openid', UserScope.Identities]));

    it('passes the scope gate for GET social access-token', async () => {
      const response = await request.get('/my-account/identities/google/access-token');

      // No stored secret in this test, so the handler proceeds past the scope gate to a 404.
      expect(response.status).toBe(404);
      expect(findSocialTokenSetSecretByUserIdAndTarget).toHaveBeenCalledWith(mockUser.id, 'google');
    });

    it('passes the scope gate for GET enterprise SSO access-token', async () => {
      const response = await request.get('/my-account/sso-identities/sso-conn/access-token');

      expect(response.status).toBe(404);
      expect(findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId).toHaveBeenCalledWith(
        mockUser.id,
        'sso-conn'
      );
    });
  });

  describe('from a third-party application', () => {
    const request = buildRequester(
      new Set(['openid', UserScope.Identities]),
      'third-party-application'
    );

    it('rejects GET social access-token and does not read the stored secret', async () => {
      rejectAsThirdParty();

      const response = await request.get('/my-account/identities/google/access-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.third_party_application_forbidden');
      expect(findSocialTokenSetSecretByUserIdAndTarget).not.toHaveBeenCalled();
    });

    it('rejects GET enterprise SSO access-token and does not read the stored secret', async () => {
      rejectAsThirdParty();

      const response = await request.get('/my-account/sso-identities/sso-conn/access-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.third_party_application_forbidden');
      expect(findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId).not.toHaveBeenCalled();
    });

    it('rejects PUT social access-token before any verification work', async () => {
      rejectAsThirdParty();

      const response = await request
        .put('/my-account/identities/google/access-token')
        .send({ verificationRecordId: 'mock-verification-record-id' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('code', 'auth.third_party_application_forbidden');
    });

    it('passes the client to the first-party assertion', async () => {
      await request.get('/my-account/identities/google/access-token');

      expect(assertFirstPartyClient).toHaveBeenCalledWith(
        expect.any(Object),
        'third-party-application'
      );
    });
  });
});
