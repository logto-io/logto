import { ConnectorType } from '@logto/connector-kit';
import { type SupportedSsoConnector } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockAdminUserRole } from '#src/__mocks__/index.js';
import { mockSamlSsoConnector } from '#src/__mocks__/sso.js';
import RequestError from '#src/errors/RequestError/index.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { mockConnector, mockMetadata, mockLogtoConnector } from '../__mocks__/connector.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

type SsoConnectorData = { id: string; config: Record<string, unknown> };

const mockParseSamlAssertionContent = jest.fn();
const mockGetUserInfoFromSamlAssertion = jest.fn();

class MockSamlSsoConnector extends SamlConnector {
  parseSamlAssertionContent: jest.Mock = mockParseSamlAssertionContent;
  getUserInfoFromSamlAssertion: jest.Mock = mockGetUserInfoFromSamlAssertion;

  constructor(data: SsoConnectorData, endpoint: URL, ..._rest: unknown[]) {
    super(endpoint, data.id, data.config);
  }
}

const mockSamlConnectorFactoryConstructor = jest
  .fn()
  .mockImplementation((...args: [SsoConnectorData, URL]) => new MockSamlSsoConnector(...args));

const { verifyBearerTokenFromRequest } = await mockEsmWithActual(
  '#src/middleware/koa-auth.js',
  () => ({
    verifyBearerTokenFromRequest: jest.fn(),
  })
);

await mockEsmWithActual('#src/sso/index.js', () => ({
  ssoConnectorFactories: {
    SAML: {
      provider: 'SAML',
      constructor: mockSamlConnectorFactoryConstructor,
      configGuard: { safeParse: jest.fn().mockReturnValue({ success: true, data: {} }) },
    },
    OIDC: {},
    AZURE_AD: {},
    AZURE_AD_OIDC: {},
    GOOGLE_WORKSPACE: {},
    OKTA: {},
  },
}));
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

const usersLibraries = {
  findUserRoles: jest.fn(async () => [mockAdminUserRole]),
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

// SSO SAML ACS endpoint test helpers
const ssoSsoConnectorsLibrary = {
  getSsoConnectorById: jest.fn(async (connectorId: string) => {
    if (connectorId !== 'saml_sso_connector') {
      throw new RequestError({ code: 'entity.not_found', status: 404, connectorId });
    }

    return mockSamlSsoConnector as unknown as SupportedSsoConnector;
  }),
};

const mockFindActiveVerificationRecordById = jest.fn();
const mockUpdateVerificationRecord = jest.fn();

const ssoTenantContext = new MockTenant(
  createMockProvider(jest.fn().mockResolvedValue(baseProviderMock)),
  {
    verificationRecords: {
      findActiveVerificationRecordById: mockFindActiveVerificationRecordById,
      update: mockUpdateVerificationRecord,
    },
  },
  undefined,
  {
    users: usersLibraries,
    socials: socialsLibraries,
    ssoConnectors: ssoSsoConnectorsLibrary,
  }
);

const ssoRequest = createRequester({
  anonymousRoutes: await pickDefault(import('#src/routes/authn.js')),
  tenantContext: ssoTenantContext,
});

describe('authn route for Hasura', () => {
  const mockUserId = 'foo';
  const mockExpectedRole = mockAdminUserRole.name;
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

describe('authn route for SSO SAML ACS (verification-record path)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /authn/single-sign-on/saml/non_existent_connector should throw 404', async () => {
    const response = await ssoRequest
      .post('/authn/single-sign-on/saml/non_existent_connector')
      .send({
        SAMLResponse: 'saml_response',
        RelayState: 'relay_state',
      });
    expect(response.status).toEqual(404);
  });

  it('POST /authn/single-sign-on/saml/saml_sso_connector should throw 404 when no verification record found', async () => {
    mockFindActiveVerificationRecordById.mockResolvedValue();

    const response = await ssoRequest.post('/authn/single-sign-on/saml/saml_sso_connector').send({
      SAMLResponse: 'saml_response',
      RelayState: 'relay_state',
    });
    expect(response.status).toEqual(404);
  });

  it('POST /authn/single-sign-on/saml/saml_sso_connector with valid RelayState and verification record should redirect', async () => {
    const redirectUri = 'https://example.com/callback';
    const state = 'test-state';

    mockFindActiveVerificationRecordById.mockResolvedValue({
      id: 'relay_state',
      data: {
        type: 'EnterpriseSso',
        connectorId: 'saml_sso_connector',
        connectorSession: {
          redirectUri,
          state,
          connectorId: 'saml_sso_connector',
        },
      },
    });

    const response = await ssoRequest.post('/authn/single-sign-on/saml/saml_sso_connector').send({
      SAMLResponse: 'saml_response',
      RelayState: 'relay_state',
    });

    expect(response.status).toEqual(302);
    expect(response.headers.location).toBe(`${redirectUri}?state=${state}`);
  });

  it('POST /authn/single-sign-on/saml/saml_sso_connector with non-matching connectorId should return 400', async () => {
    mockFindActiveVerificationRecordById.mockResolvedValue({
      id: 'some_jti',
      data: {
        type: 'EnterpriseSso',
        connectorId: 'wrong_connector',
        connectorSession: {
          redirectUri: 'https://example.com/callback',
          state: 'test-state',
          connectorId: 'wrong_connector',
        },
      },
    });

    const response = await ssoRequest.post('/authn/single-sign-on/saml/saml_sso_connector').send({
      SAMLResponse: 'saml_response',
      RelayState: 'some_jti',
    });

    expect(response.status).toEqual(400);
  });
});
