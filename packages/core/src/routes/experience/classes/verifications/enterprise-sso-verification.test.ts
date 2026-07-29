import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { VerificationType, type SupportedSsoConnector } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSamlSsoConnector } from '#src/__mocks__/sso.js';
import { idpInitiatedSamlSsoSessionCookieName } from '#src/constants/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import OidcConnector from '#src/sso/OidcConnector/index.js';
import SamlConnector from '#src/sso/SamlConnector/index.js';
import { type ExtendedSocialUserInfo } from '#src/sso/types/saml.js';
import { type SingleSignOnConnectorSession } from '#src/sso/types/session.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { type Cookies } from '#src/test-utils/jest-koa-mocks/create-mock-cookies.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockAppInsightsTrackException = jest.fn();

await mockEsmWithActual('@logto/app-insights/node', () => ({
  appInsights: { trackException: mockAppInsightsTrackException },
}));

const mockEnvSetValues: { isDevFeaturesEnabled: boolean } = {
  isDevFeaturesEnabled: false,
};

jest.mock('#src/env-set/index.js', () => ({
  EnvSet: { values: mockEnvSetValues },
}));

const mockGetAuthorizationUrl = jest.fn<
  Promise<string>,
  [Record<string, unknown>, (session: SingleSignOnConnectorSession) => Promise<void>]
>();

const mockGetIssuer = jest.fn<Promise<string>>();

const mockGetUserInfo = jest.fn<
  Promise<{ userInfo: ExtendedSocialUserInfo; tokenResponse?: Record<string, unknown> }>,
  [SingleSignOnConnectorSession]
>();

const mockGetUserInfoFromSamlAssertion = jest.fn<ExtendedSocialUserInfo, [unknown]>();

const createSamlMock = () => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  return Object.setPrototypeOf(
    {
      getAuthorizationUrl: mockGetAuthorizationUrl,
      getIssuer: mockGetIssuer,
      getUserInfo: mockGetUserInfo,
      getUserInfoFromSamlAssertion: mockGetUserInfoFromSamlAssertion,
    },
    SamlConnector.prototype
  );
};

const createOidcMock = () => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  return Object.setPrototypeOf(
    {
      getAuthorizationUrl: mockGetAuthorizationUrl,
      getIssuer: mockGetIssuer,
      getUserInfo: mockGetUserInfo,
    },
    OidcConnector.prototype
  );
};

await mockEsmWithActual('#src/sso/index.js', () => ({
  ssoConnectorFactories: {
    SAML: { constructor: jest.fn().mockImplementation(() => createSamlMock()) },
    OIDC: { constructor: jest.fn().mockImplementation(() => createOidcMock()) },
    AZURE_AD: { constructor: jest.fn().mockImplementation(() => createSamlMock()) },
    AZURE_AD_OIDC: { constructor: jest.fn().mockImplementation(() => createOidcMock()) },
    GOOGLE_WORKSPACE: { constructor: jest.fn().mockImplementation(() => createOidcMock()) },
    OKTA: { constructor: jest.fn().mockImplementation(() => createOidcMock()) },
  },
}));

const mockGetSsoConnectorById = jest
  .fn<Promise<SupportedSsoConnector>, [string]>()
  .mockResolvedValue(mockSamlSsoConnector as unknown as SupportedSsoConnector);

const mockFindIdpInitiatedSamlSsoSessionById = jest.fn();
const mockDeleteIdpInitiatedSamlSsoSessionById = jest.fn();
const mockFindActiveVerificationRecordById = jest.fn();

const mockTenant = new MockTenant(
  undefined,
  {
    ssoConnectors: {
      findIdpInitiatedSamlSsoSessionById: mockFindIdpInitiatedSamlSsoSessionById,
      deleteIdpInitiatedSamlSsoSessionById: mockDeleteIdpInitiatedSamlSsoSessionById,
    },
    verificationRecords: {
      findActiveVerificationRecordById: mockFindActiveVerificationRecordById,
    },
  },
  undefined,
  { ssoConnectors: { getSsoConnectorById: mockGetSsoConnectorById } }
);

const mockConnectorSession: SingleSignOnConnectorSession = {
  state: 'test-state',
  redirectUri: 'https://example.com/callback',
  connectorId: mockSamlSsoConnector.id,
};

const mockUserInfo: ExtendedSocialUserInfo = {
  id: 'saml-user-id',
  email: 'user@example.com',
  name: 'Test User',
};

const createMockCtx = (cookieOverrides?: Record<string, string | undefined>): WithLogContext => {
  const cookieStore: Record<string, string> = {};
  return {
    ...createMockContext(),
    ...createMockLogContext(),
    cookies: {
      get: jest.fn((key: string) => cookieOverrides?.[key] ?? cookieStore[key]),
      set: jest.fn((key: string, value: string) => {
        // eslint-disable-next-line @silverhand/fp/no-mutation
        cookieStore[key] = value;
      }),
    } as unknown as Cookies,
  };
};

const { EnterpriseSsoVerification } = await import('./enterprise-sso-verification.js');

const createVerification = () =>
  EnterpriseSsoVerification.create(
    mockTenant.libraries,
    mockTenant.queries,
    mockSamlSsoConnector.id
  );

describe('EnterpriseSsoVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthorizationUrl.mockReset();
    mockGetIssuer.mockReset();
    mockGetUserInfo.mockReset();
    mockGetUserInfoFromSamlAssertion.mockReset();
    mockGetSsoConnectorById.mockResolvedValue(
      mockSamlSsoConnector as unknown as SupportedSsoConnector
    );
    mockFindIdpInitiatedSamlSsoSessionById.mockReset();
    mockDeleteIdpInitiatedSamlSsoSessionById.mockReset();
    mockFindActiveVerificationRecordById.mockReset();
  });

  describe('constructor and basic properties', () => {
    it('should create instance with correct properties', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
      });
      expect(verification.id).toBe('test-id');
      expect(verification.connectorId).toBe('saml-connector');
      expect(verification.type).toBe(VerificationType.EnterpriseSso);
      expect(verification.isVerified).toBe(false);
    });
    it('should create instance using factory method', () => {
      const verification = EnterpriseSsoVerification.create(
        mockTenant.libraries,
        mockTenant.queries,
        'saml-connector'
      );
      expect(verification.connectorId).toBe('saml-connector');
      expect(verification.type).toBe(VerificationType.EnterpriseSso);
      expect(verification.isVerified).toBe(false);
    });
    it('should initialize connectorSession as empty object when not provided', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
      });
      expect(verification.connectorSession).toEqual({});
    });
    it('should restore connectorSession from data', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
        connectorSession: {
          state: 'foo',
          redirectUri: 'https://example.com',
          connectorId: 'saml-connector',
        },
      });
      expect(verification.connectorSession).toEqual({
        state: 'foo',
        redirectUri: 'https://example.com',
        connectorId: 'saml-connector',
      });
    });
    it('should report isVerified when enterpriseSsoUserInfo and issuer are set', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
      });
      expect(verification.isVerified).toBe(false);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.enterpriseSsoUserInfo = mockUserInfo;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.issuer = 'https://idp.example.com';
      expect(verification.isVerified).toBe(true);
    });
  });

  describe('toJson/toSanitizedJson', () => {
    it('should serialize to JSON preserving connectorSession', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
      });
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = mockConnectorSession;
      const json = verification.toJson();
      expect(json.id).toBe('test-id');
      expect(json.connectorSession).toEqual(mockConnectorSession);
    });
    it('should sanitize JSON by omitting connectorSession and encrypted fields', () => {
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: 'test-id',
        connectorId: 'saml-connector',
        type: VerificationType.EnterpriseSso,
      });
      const sanitized = verification.toSanitizedJson();
      expect(sanitized).not.toHaveProperty('connectorSession');
      expect(sanitized).not.toHaveProperty('encryptedTokenSet');
    });
  });

  describe('createAuthorizationUrl', () => {
    it('should delegate to createSocialAuthorizationSession and return the authorization URL', async () => {
      const verification = createVerification();
      const redirectUri = 'https://example.com/callback';
      mockGetAuthorizationUrl.mockResolvedValue('https://idp.example.com/sso');
      const ctx = createMockCtx();
      const authUrl = await verification.createAuthorizationUrl(ctx, mockTenant, {
        state: 'test-state',
        redirectUri,
      });
      expect(authUrl).toBe('https://idp.example.com/sso');
      expect(mockGetAuthorizationUrl).toHaveBeenCalledWith(
        expect.objectContaining({ jti: verification.id, state: 'test-state', redirectUri }),
        expect.any(Function)
      );
      const setSessionCallback = mockGetAuthorizationUrl.mock.calls[0][1];
      await setSessionCallback(mockConnectorSession);
      expect(verification.connectorSession).toEqual(mockConnectorSession);
    });
    it('should handle IdP-initiated SAML session when cookie and dev features are enabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      mockEnvSetValues.isDevFeaturesEnabled = true;
      const sessionId = 'idp-session-id';
      mockFindIdpInitiatedSamlSsoSessionById.mockResolvedValue({
        id: sessionId,
        connectorId: mockSamlSsoConnector.id,
        expiresAt: Date.now() + 60_000,
        assertionContent: { SAMLResponse: 'mock-assertion' },
      });
      mockGetUserInfoFromSamlAssertion.mockReturnValue(mockUserInfo);
      const ctx = createMockCtx({ [idpInitiatedSamlSsoSessionCookieName]: sessionId });
      const verification = createVerification();
      const authUrl = await verification.createAuthorizationUrl(ctx, mockTenant, {
        state: 'test-state',
        redirectUri: 'https://example.com/callback',
      });
      expect(authUrl).toBe('https://example.com/callback?state=test-state');
      expect(verification.connectorSession).toEqual({
        redirectUri: 'https://example.com/callback',
        state: 'test-state',
        connectorId: mockSamlSsoConnector.id,
        userInfo: mockUserInfo,
      });
      expect(ctx.cookies.set).toHaveBeenCalledWith(
        idpInitiatedSamlSsoSessionCookieName,
        '',
        expect.any(Object)
      );
      expect(mockDeleteIdpInitiatedSamlSsoSessionById).toHaveBeenCalledWith(sessionId);
      expect(mockGetAuthorizationUrl).not.toHaveBeenCalled();
    });
    it('should not handle IdP-initiated session when dev features are disabled', async () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      mockEnvSetValues.isDevFeaturesEnabled = false;
      mockGetAuthorizationUrl.mockResolvedValue('https://idp.example.com/sso');
      const ctx = createMockCtx({ [idpInitiatedSamlSsoSessionCookieName]: 'idp-session-id' });
      const verification = createVerification();
      await verification.createAuthorizationUrl(ctx, mockTenant, {
        state: 'test-state',
        redirectUri: 'https://example.com/callback',
      });
      expect(mockGetAuthorizationUrl).toHaveBeenCalled();
      expect(mockGetUserInfoFromSamlAssertion).not.toHaveBeenCalled();
    });
  });

  describe('verify', () => {
    const defaultIssuer = 'https://idp.example.com';
    beforeEach(() => {
      mockGetIssuer.mockResolvedValue(defaultIssuer);
      mockGetUserInfo.mockResolvedValue({ userInfo: mockUserInfo });
    });
    it('should verify using connectorSession and set enterpriseSsoUserInfo', async () => {
      const verification = createVerification();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = mockConnectorSession;
      const ctx = createMockCtx();
      await verification.verify(ctx, mockTenant, {});
      expect(verification.issuer).toBe(defaultIssuer);
      expect(verification.enterpriseSsoUserInfo).toEqual(mockUserInfo);
      expect(verification.isVerified).toBe(true);
      expect(mockGetUserInfo).toHaveBeenCalledWith(mockConnectorSession);
    });
    it('should throw when connectorSession is empty', async () => {
      const verification = createVerification();
      const ctx = createMockCtx();
      await expect(verification.verify(ctx, mockTenant, {})).rejects.toMatchError(
        new RequestError({ code: 'session.connector_validation_session_not_found', status: 400 })
      );
    });
    it('should throw when connectorSession is missing required fields', async () => {
      const verification = createVerification();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = { someIrrelevantField: 'value' };
      const ctx = createMockCtx();
      await expect(verification.verify(ctx, mockTenant, {})).rejects.toMatchError(
        new RequestError({ code: 'session.connector_validation_session_not_found', status: 400 })
      );
    });
    it('should load connectorSession from DB when it has userInfo for SAML connectors', async () => {
      const verificationId = 'test-verification-id';
      const verification = new EnterpriseSsoVerification(mockTenant.libraries, mockTenant.queries, {
        id: verificationId,
        connectorId: mockSamlSsoConnector.id,
        type: VerificationType.EnterpriseSso,
      });
      const databaseSession = { ...mockConnectorSession, userInfo: mockUserInfo };
      mockFindActiveVerificationRecordById.mockResolvedValue({
        id: verificationId,
        data: {
          type: VerificationType.EnterpriseSso,
          connectorId: mockSamlSsoConnector.id,
          connectorSession: databaseSession,
        },
      });
      const ctx = createMockCtx();
      await verification.verify(ctx, mockTenant, {});
      expect(mockFindActiveVerificationRecordById).toHaveBeenCalledWith(verificationId);
      expect(verification.connectorSession).toEqual(databaseSession);
      expect(verification.issuer).toBe(defaultIssuer);
      expect(verification.enterpriseSsoUserInfo).toEqual(mockUserInfo);
    });
    it('should not query DB for OIDC connectors', async () => {
      const oidcConnectorData = {
        ...mockSamlSsoConnector,
        providerName: 'OIDC',
      } satisfies SupportedSsoConnector;
      mockGetSsoConnectorById.mockResolvedValue(oidcConnectorData);
      const verification = EnterpriseSsoVerification.create(
        mockTenant.libraries,
        mockTenant.queries,
        oidcConnectorData.id
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = mockConnectorSession;
      const ctx = createMockCtx();
      await verification.verify(ctx, mockTenant, {});
      expect(mockFindActiveVerificationRecordById).not.toHaveBeenCalled();
    });
    it('should map connector errors to RequestError with appropriate HTTP status', async () => {
      const verification = createVerification();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = mockConnectorSession;
      mockGetUserInfo.mockRejectedValue(
        new ConnectorError(ConnectorErrorCodes.InvalidResponse, { detail: 'bad response' })
      );
      const ctx = createMockCtx();
      await expect(verification.verify(ctx, mockTenant, {})).rejects.toMatchError(
        new RequestError(
          { code: `connector.${ConnectorErrorCodes.InvalidResponse}`, status: 400 },
          { detail: 'bad response' }
        )
      );
    });
    it('should let non-connector errors propagate', async () => {
      const verification = createVerification();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.connectorSession = mockConnectorSession;
      mockGetIssuer.mockRejectedValue(new Error('unexpected error'));
      const ctx = createMockCtx();
      await expect(verification.verify(ctx, mockTenant, {})).rejects.toThrow('unexpected error');
    });
  });

  describe('identifyUser', () => {
    it('should throw verification_failed when not verified', async () => {
      const verification = createVerification();
      await expect(verification.identifyUser()).rejects.toMatchError(
        new RequestError({ code: 'session.verification_failed', status: 400 })
      );
    });
  });

  describe('getTokenSetSecret', () => {
    it('should return undefined when not fully verified', () => {
      const verification = createVerification();
      expect(verification.getTokenSetSecret()).toBeUndefined();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.enterpriseSsoUserInfo = mockUserInfo;
      expect(verification.getTokenSetSecret()).toBeUndefined();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.issuer = 'issuer';
      expect(verification.getTokenSetSecret()).toBeUndefined();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      verification.encryptedTokenSet = {
        encryptedTokenSetBase64: 'data',
        metadata: { hasRefreshToken: false },
      };
      expect(verification.getTokenSetSecret()).toBeDefined();
    });
  });
});
