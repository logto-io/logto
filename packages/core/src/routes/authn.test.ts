import { ConnectorType } from '@logto/connector-kit';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockRole } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import Libraries from '#src/tenants/Libraries.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { mockConnector, mockMetadata, mockLogtoConnector } from '../__mocks__/connector.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { verifyBearerTokenFromRequest } = await mockEsmWithActual(
  '#src/middleware/koa-auth.js',
  () => ({
    verifyBearerTokenFromRequest: jest.fn(),
  })
);
const validateSamlAssertion = jest.fn();

const mockSamlLogtoConnector = {
  dbEntry: { ...mockConnector, connectorId: 'saml', id: 'saml_connector' },
  metadata: { ...mockMetadata, isStandard: true, id: 'saml', target: 'saml' },
  type: ConnectorType.Social,
  ...mockLogtoConnector,
  validateSamlAssertion,
};

const socialsLibraries = {
  getConnector: jest.fn(async (connectorId: string) => {
    if (connectorId !== 'saml_connector') {
      throw new RequestError({
        code: 'entity.not_found',
        connectorId,
        status: 404,
      });
    }

    return mockSamlLogtoConnector;
  }),
};

const baseProviderMock = {
  params: {},
  jti: 'jti',
  client_id: 'client_id',
};

// Const samlAssertionHandlerRoutes = await pickDefault(import('./authn/saml.js'));
// const tenantContext = new MockTenant(
//   createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
//   undefined,
//   { socials: socialsLibraries }
// );

const usersLibraries = {
  findUserRoles: jest.fn(async () => [mockRole]),
} satisfies Partial<Libraries['users']>;

const tenantContext = new MockTenant(
  createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  undefined,
  undefined,
  { users: usersLibraries, socials: socialsLibraries }
);
const { createRequester } = await import('#src/utils/test-utils.js');
const request = createRequester({
  anonymousRoutes: await pickDefault(import('#src/routes/authn.js')),
  tenantContext,
});

describe('authn route for Hasura', () => {
  const mockUserId = 'foo';
  const mockExpectedRole = mockRole.name;
  const mockUnauthorizedRole = 'V';
  const keys = Object.freeze({
    expectedRole: 'Expected-Role',
    hasuraUserId: 'X-Hasura-User-Id',
    hasuraRole: 'X-Hasura-Role',
  });

  describe('with successful verification', () => {
    beforeEach(() => {
      verifyBearerTokenFromRequest.mockResolvedValue({
        clientId: 'ok',
        sub: mockUserId,
      });
    });

    it('has expected role', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockExpectedRole,
      });
    });

    it('throws 401 if no expected role present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole + '1');
      expect(response.status).toEqual(401);
    });

    it('falls back to unauthorized role if no expected role present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole })
        .set(keys.expectedRole, mockExpectedRole + '1');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });
  });

  describe('with failed verification', () => {
    beforeEach(() => {
      verifyBearerTokenFromRequest.mockImplementation(async (_, __, resource) => {
        if (resource) {
          throw new RequestError({ code: 'auth.jwt_sub_missing', status: 401 });
        }

        return { clientId: 'not ok', sub: mockUserId };
      });
    });

    it('throws 401 if no unauthorized role presents', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(401);
    });

    it('falls back to unauthorized role with user id if no expected resource present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });

    it('falls back to unauthorized role if JWT is invalid', async () => {
      verifyBearerTokenFromRequest.mockRejectedValue(
        new RequestError({ code: 'auth.jwt_sub_missing', status: 401 })
      );

      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });
  });
});

describe('authn route for SAML', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /authn/saml/non_saml_connector should throw 404', async () => {
    const response = await request.post('/authn/saml/non_saml_connector');
    expect(response.status).toEqual(404);
  });

  it('POST /authn/saml/saml_connector should throw when `RelayState` missing', async () => {
    const response = await request.post('/authn/saml/saml_connector').send({
      SAMLResponse: 'saml_response',
    });
    expect(response.status).toEqual(500);
  });

  it('POST /authn/saml/saml_connector', async () => {
    await request.post('/authn/saml/saml_connector').send({
      SAMLResponse: 'saml_response',
      RelayState: 'relay_state',
    });
    expect(validateSamlAssertion).toHaveBeenCalledWith(
      { body: { RelayState: 'relay_state', SAMLResponse: 'saml_response' } },
      expect.anything(),
      expect.anything()
    );
  });
});
