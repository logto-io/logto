import { UserScope, ReservedScope } from '@logto/core-kit';
import { NameIdFormat } from '@logto/schemas';
import nock from 'nock';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';

import { SamlApplication } from './index.js';

const { jest } = import.meta;

// Create a test class that exposes protected methods
class TestSamlApplication extends SamlApplication {
  public exposedCreateSamlTemplateCallback = this.createSamlTemplateCallback;
  public exposedExchangeAuthorizationCode = this.exchangeAuthorizationCode;
  public exposedGetUserInfo = this.getUserInfo;
  public exposedFetchOidcConfig = this.fetchOidcConfig;
  public exposedGetScopesFromAttributeMapping = this.getScopesFromAttributeMapping;
  public exposedBuildLoginResponseTemplate = this.buildLoginResponseTemplate;
  public exposedBuildSamlAttributesTagValues = this.buildSamlAttributesTagValues;
}

describe('SamlApplication', () => {
  const mockDetails = {
    entityId: 'sp-entity-id',
    acsUrl: {
      binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      url: 'https://sp.example.com/acs',
    },
    oidcClientMetadata: {
      redirectUris: ['https://app.example.com/callback'],
    },
    privateKey: 'mock-private-key',
    certificate: 'mock-certificate',
    secret: 'mock-secret',
    nameIdFormat: NameIdFormat.Persistent,
    attributeMapping: {},
  };

  const mockUser = {
    sub: 'user123',
    email: 'user@example.com',
    name: 'Test User',
    phone: '+1234567890',
    phone_verified: true,
  };

  const mockTenantId = 'tenant-id';
  const mockSamlApplicationId = 'saml-app-id';
  const mockIssuer = 'https://issuer.example.com';

  const mockEndpoint = 'https://auth.example.com';
  const mockAuthEndpoint = `${mockEndpoint}/auth`;
  const mockTokenEndpoint = `${mockEndpoint}/token`;
  const mockUserinfoEndpoint = `${mockEndpoint}/userinfo`;
  const mockJwks = `${mockEndpoint}/jwks`;

  // eslint-disable-next-line @silverhand/fp/no-let
  let samlApp: TestSamlApplication;

  beforeEach(() => {
    // @ts-expect-error
    // eslint-disable-next-line @silverhand/fp/no-mutation
    samlApp = new TestSamlApplication(mockDetails, mockSamlApplicationId, {
      oidc: { issuer: mockIssuer },
      endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
    });

    nock(mockIssuer).get('/.well-known/openid-configuration').reply(200, {
      token_endpoint: mockTokenEndpoint,
      authorization_endpoint: mockAuthEndpoint,
      userinfo_endpoint: mockUserinfoEndpoint,
      jwks_uri: mockJwks,
      issuer: mockIssuer,
    });
  });

  describe('createSamlTemplateCallback', () => {
    it('should create SAML template callback with correct values', () => {
      const result = samlApp.exposedCreateSamlTemplateCallback({
        userInfo: mockUser,
        samlRequestId: null,
      })('ID:NameID:attrEmail:attrName');
      const generatedId = result.id.replace('ID_', '');

      expect(result.id).toBe('ID_' + generatedId);
      expect(typeof result.context).toBe('string');
    });
  });

  describe('exchangeAuthorizationCode', () => {
    const mockCode = 'auth-code';

    beforeEach(() => {
      // @ts-expect-error -- for testing
      jest.spyOn(samlApp, 'exposedFetchOidcConfig').mockResolvedValue({
        tokenEndpoint: mockTokenEndpoint,
      });
    });

    afterEach(() => {
      nock.cleanAll();
      jest.restoreAllMocks();
    });

    it('should exchange authorization code successfully', async () => {
      const mockResponse = {
        access_token: 'access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email',
        id_token: 'mock.id.token',
      };

      const expectedAuthHeader = `Basic ${Buffer.from(
        `${mockSamlApplicationId}:${mockDetails.secret}`,
        'utf8'
      ).toString('base64')}`;

      const redirectUri = mockDetails.oidcClientMetadata.redirectUris[0]!;

      nock(mockEndpoint)
        .post(
          '/token',
          `grant_type=authorization_code&code=${mockCode}&client_id=${mockSamlApplicationId}&redirect_uri=${encodeURIComponent(
            redirectUri
          )}`
        )
        .matchHeader('Authorization', expectedAuthHeader)
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, mockResponse);

      const result = await samlApp.exposedExchangeAuthorizationCode({ code: mockCode });

      expect(result).toMatchObject({
        accessToken: mockResponse.access_token,
        tokenType: mockResponse.token_type,
        expiresIn: mockResponse.expires_in,
        scope: mockResponse.scope,
        idToken: mockResponse.id_token,
      });
    });

    it('should throw error if token exchange fails', async () => {
      nock(mockEndpoint).post('/token').reply(400, { error: 'invalid_grant' });

      await expect(samlApp.exposedExchangeAuthorizationCode({ code: mockCode })).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    const mockAccessToken = 'access-token';

    beforeEach(() => {
      // @ts-expect-error -- for testing
      jest.spyOn(samlApp, 'exposedFetchOidcConfig').mockResolvedValue({
        userinfoEndpoint: mockUserinfoEndpoint,
      });
    });

    afterEach(() => {
      nock.cleanAll();
      jest.restoreAllMocks();
    });

    it('should get user info successfully', async () => {
      const scope = nock(mockEndpoint)
        .get('/userinfo')
        .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
        .reply(200, JSON.stringify(mockUser));

      const result = await samlApp.exposedGetUserInfo({
        accessToken: mockAccessToken,
      });

      expect(result).toEqual(mockUser);
      expect(scope.isDone()).toBe(true);
    });

    it('should throw error if userinfo request fails', async () => {
      nock(mockEndpoint).get('/userinfo').reply(400, { error: 'invalid_token' });

      await expect(samlApp.exposedGetUserInfo({ accessToken: mockAccessToken })).rejects.toThrow();
    });
  });

  describe('getScopesFromAttributeMapping', () => {
    it('should include default scopes and email scope when nameIdFormat is EmailAddress', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          nameIdFormat: NameIdFormat.EmailAddress,
          attributeMapping: {},
        },
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(UserScope.Email);
      expect(scopes).toContain(ReservedScope.OpenId);
      expect(scopes).toContain(UserScope.Profile);
      expect(scopes).toHaveLength(3);
    });

    it('should include default scopes when attributeMapping is empty', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {},
        },
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toHaveLength(2);
      expect(scopes).toContain(ReservedScope.OpenId);
      expect(scopes).toContain(UserScope.Profile);
    });

    it('should return correct scopes based on attributeMapping', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            email: 'email',
            name: 'name',
          },
        },
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(ReservedScope.OpenId);
      expect(scopes).toContain(UserScope.Profile);
      expect(scopes).toContain(UserScope.Email);
      expect(scopes).toHaveLength(3);
    });

    it('should ignore id claim in attributeMapping', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            sub: 'sub',
            name: 'name',
          },
        },
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(ReservedScope.OpenId);
      expect(scopes).toContain(UserScope.Profile);
      expect(scopes).toHaveLength(2);
    });

    it('should deduplicate scopes when multiple claims map to the same scope', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            name: 'name',
            nickname: 'nickname',
            preferred_username: 'preferred_username',
            custom_data: 'custom_data',
            organization_data: 'organization_data',
            sso_identities: 'sso_identities',
            phone_number: 'phone_number',
            roles: 'roles',
          },
        },
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(ReservedScope.OpenId);
      expect(scopes).toContain(UserScope.Profile);
      expect(scopes).toContain(UserScope.Organizations);
      expect(scopes).toContain(UserScope.Identities);
      expect(scopes).toContain(UserScope.CustomData);
      expect(scopes).toContain(UserScope.Phone);
      expect(scopes).toContain(UserScope.Roles);
      expect(scopes).toHaveLength(7);
    });
  });

  describe('buildLoginResponseTemplate', () => {
    it('should generate correct SAML response template with attribute mapping', () => {
      const mockDetailsWithMapping = {
        ...mockDetails,
        attributeMapping: {
          sub: 'userId',
          email: 'emailAddress',
          name: 'displayName',
        },
      };

      const samlApp = new TestSamlApplication(
        // @ts-expect-error
        mockDetailsWithMapping,
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const template = samlApp.exposedBuildLoginResponseTemplate();

      expect(template.attributes).toEqual([
        {
          name: 'userId',
          valueTag: 'userId',
          nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
          valueXsiType: 'xs:string',
        },
        {
          name: 'emailAddress',
          valueTag: 'emailAddress',
          nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
          valueXsiType: 'xs:string',
        },
        {
          name: 'displayName',
          valueTag: 'displayName',
          nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
          valueXsiType: 'xs:string',
        },
      ]);
    });
  });

  describe('buildSamlAttributesTagValues', () => {
    it('should generate correct SAML attribute tag values from user info', () => {
      const mockDetailsWithMapping = {
        ...mockDetails,
        attributeMapping: {
          sub: 'userId',
          email: 'emailAddress',
          name: 'displayName',
          phone: 'phoneNumber',
        },
      };

      const samlApp = new TestSamlApplication(
        // @ts-expect-error
        mockDetailsWithMapping,
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const tagValues = samlApp.exposedBuildSamlAttributesTagValues(mockUser);

      expect(tagValues).toEqual({
        attrUserId: 'user123',
        attrEmailAddress: 'user@example.com',
        attrDisplayName: 'Test User',
        attrPhoneNumber: '+1234567890',
      });
    });

    it('should skip undefined or null values from user info', () => {
      const mockDetailsWithMapping = {
        ...mockDetails,
        attributeMapping: {
          sub: 'userId',
          email: 'emailAddress',
          name: 'displayName',
          picture: 'avatar', // This field doesn't exist in mockUser
        },
      };

      const samlApp = new TestSamlApplication(
        // @ts-expect-error
        mockDetailsWithMapping,
        mockSamlApplicationId,
        {
          oidc: { issuer: mockIssuer },
          endpoint: getTenantEndpoint(mockTenantId, EnvSet.values),
        }
      );

      const tagValues = samlApp.exposedBuildSamlAttributesTagValues(mockUser);

      expect(tagValues).toEqual({
        attrAvatar: 'null',
        attrUserId: 'user123',
        attrEmailAddress: 'user@example.com',
        attrDisplayName: 'Test User',
      });
    });
  });
});
