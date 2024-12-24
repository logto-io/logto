import nock from 'nock';

import { SamlApplication, generateAutoSubmitForm, buildSamlAssertionNameId } from './utils.js';

const { jest } = import.meta;

// Create a test class that exposes protected methods
class TestSamlApplication extends SamlApplication {
  public exposedCreateSamlTemplateCallback = this.createSamlTemplateCallback;
  public exposedExchangeAuthorizationCode = this.exchangeAuthorizationCode;
  public exposedGetUserInfo = this.getUserInfo;
  public exposedFetchOidcConfig = this.fetchOidcConfig;
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
  };

  const mockUser = {
    sub: 'user123',
    email: 'user@example.com',
    name: 'Test User',
  };

  const mockTenantId = 'tenant-id';
  const mockSamlApplicationId = 'saml-app-id';
  const mockIssuer = 'https://issuer.example.com';

  const mockEndpoint = 'http://auth.example.com';
  const mockAuthEndpoint = `${mockEndpoint}/auth`;
  const mockTokenEndpoint = `${mockEndpoint}/token`;
  const mockUserinfoEndpoint = `${mockEndpoint}/userinfo`;
  const mockJwks = `${mockEndpoint}/jwks`;

  // eslint-disable-next-line @silverhand/fp/no-let
  let samlApp: TestSamlApplication;

  beforeEach(() => {
    // @ts-expect-error
    // eslint-disable-next-line @silverhand/fp/no-mutation
    samlApp = new TestSamlApplication(mockDetails, mockTenantId, mockSamlApplicationId, mockIssuer);

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

  describe('buildSamlAssertionNameId', () => {
    it('should use email when email_verified is true', () => {
      const user = {
        sub: 'user123',
        email: 'user@example.com',
        email_verified: true,
      };

      const result = buildSamlAssertionNameId(user);

      expect(result).toEqual({
        NameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        NameID: user.email,
      });
    });

    it('should use sub when email is not verified', () => {
      const user = {
        sub: 'user123',
        email: 'user@example.com',
        email_verified: false,
      };

      const result = buildSamlAssertionNameId(user);

      expect(result).toEqual({
        NameIDFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        NameID: user.sub,
      });
    });

    it('should use sub when email is not available', () => {
      const user = {
        sub: 'user123',
      };

      const result = buildSamlAssertionNameId(user);

      expect(result).toEqual({
        NameIDFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        NameID: user.sub,
      });
    });

    it('should use specified format when provided', () => {
      const user = {
        sub: 'user123',
        email: 'user@example.com',
        email_verified: false,
      };
      const format = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent';

      const result = buildSamlAssertionNameId(user, format);

      expect(result).toEqual({
        NameIDFormat: format,
        NameID: user.sub,
      });
    });
  });

  describe('generateAutoSubmitForm', () => {
    it('should generate valid HTML form with auto-submit script', () => {
      const actionUrl = 'https://example.com/acs';
      const samlResponse = 'base64EncodedSamlResponse';

      const result = generateAutoSubmitForm(actionUrl, samlResponse);

      expect(result).toContain('<html>');
      expect(result).toContain('<body>');
      expect(result).toContain('</html>');

      expect(result).toContain(`<form id="redirectForm" action="${actionUrl}" method="POST">`);
      expect(result).toContain(
        `<input type="hidden" name="SAMLResponse" value="${samlResponse}" />`
      );

      expect(result).toContain('window.onload = function()');
      expect(result).toContain("document.getElementById('redirectForm').submit()");
    });

    it('should properly escape special characters in URLs and values', () => {
      const actionUrl = 'https://example.com/acs?param=value&other=123';
      const samlResponse = 'response+with/special=characters&';

      const result = generateAutoSubmitForm(actionUrl, samlResponse);

      expect(result).toContain('action="https://example.com/acs?param=value&other=123"');
      expect(result).toContain('value="response+with/special=characters&"');
    });
  });
});
