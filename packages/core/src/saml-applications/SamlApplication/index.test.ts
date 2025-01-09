import { UserScope } from '@logto/core-kit';
import { NameIdFormat } from '@logto/schemas';
import nock from 'nock';

import { SamlApplication } from './index.js';

const { jest } = import.meta;

// Create a test class that exposes protected methods
class TestSamlApplication extends SamlApplication {
  public exposedCreateSamlTemplateCallback = this.createSamlTemplateCallback;
  public exposedExchangeAuthorizationCode = this.exchangeAuthorizationCode;
  public exposedGetUserInfo = this.getUserInfo;
  public exposedFetchOidcConfig = this.fetchOidcConfig;
  public exposedGetScopesFromAttributeMapping = this.getScopesFromAttributeMapping;
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
  };

  const mockUser = {
    sub: 'user123',
    email: 'user@example.com',
    name: 'Test User',
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
    samlApp = new TestSamlApplication(mockDetails, mockSamlApplicationId, mockIssuer, mockTenantId);

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
      const result = samlApp.exposedCreateSamlTemplateCallback(mockUser)(
        'ID:NameID:attrEmail:attrName'
      );
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
    it('should include email scope when nameIdFormat is EmailAddress', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          nameIdFormat: NameIdFormat.EmailAddress,
          attributeMapping: {},
        },
        mockSamlApplicationId,
        mockIssuer,
        mockTenantId
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(UserScope.Email);
    });

    it('should return only nameIdFormat related scope when attributeMapping is empty', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          nameIdFormat: NameIdFormat.EmailAddress,
          attributeMapping: {},
        },
        mockSamlApplicationId,
        mockIssuer,
        mockTenantId
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toHaveLength(1);
      expect(scopes).toEqual([UserScope.Email]);
    });

    it('should return correct scopes based on attributeMapping', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            name: 'name',
            email: 'email',
            custom_data: 'customData',
          },
        },
        mockSamlApplicationId,
        mockIssuer,
        mockTenantId
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toContain(UserScope.Profile); // For 'name'
      expect(scopes).toContain(UserScope.Email); // For 'email'
      expect(scopes).toContain(UserScope.CustomData); // For 'custom_data'
    });

    it('should ignore id claim in attributeMapping', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            id: 'userId',
            name: 'name',
          },
        },
        mockSamlApplicationId,
        mockIssuer,
        mockTenantId
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toHaveLength(1);
      expect(scopes).toContain(UserScope.Profile); // Only for 'name'
    });

    it('should deduplicate scopes when multiple claims map to the same scope', () => {
      const app = new TestSamlApplication(
        // @ts-expect-error
        {
          ...mockDetails,
          attributeMapping: {
            name: 'name',
            given_name: 'givenName',
            family_name: 'familyName',
          },
        },
        mockSamlApplicationId,
        mockIssuer,
        mockTenantId
      );

      const scopes = app.exposedGetScopesFromAttributeMapping();
      expect(scopes).toHaveLength(1);
      expect(scopes).toContain(UserScope.Profile); // All claims map to 'profile' scope
    });
  });
});
