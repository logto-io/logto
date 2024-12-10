import nock from 'nock';
import type { IdentityProviderInstance, ServiceProviderInstance } from 'samlify';

import {
  createSamlTemplateCallback,
  exchangeAuthorizationCode,
  getUserInfo,
  setupSamlProviders,
} from './utils.js';

const { jest } = import.meta;

describe('createSamlTemplateCallback', () => {
  const mockIdp = {
    entityMeta: {
      getEntityID: () => 'idp-entity-id',
    },
    entitySetting: {
      nameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    },
    createLoginResponse: jest.fn(),
    parseLoginRequest: jest.fn(),
    entityType: 'idp',
    getEntitySetting: jest.fn(),
  };

  const mockSp = {
    entityMeta: {
      getAssertionConsumerService: () => 'https://sp.example.com/acs',
      getEntityID: () => 'sp-entity-id',
    },
    createLoginRequest: jest.fn(),
    parseLoginResponse: jest.fn(),
    entitySetting: {},
    entityType: 'sp',
  };

  const mockUser = {
    sub: 'user123',
    email: 'user@example.com',
    name: 'Test User',
  };

  it('should create SAML template callback with correct values', () => {
    const callback = createSamlTemplateCallback(
      mockIdp as unknown as IdentityProviderInstance,
      mockSp as unknown as ServiceProviderInstance,
      mockUser
    );

    const result = callback('ID:NameID:attrEmail:attrName');
    const generatedId = result.id.replace('ID_', '');

    expect(result.id).toBe('ID_' + generatedId);
    expect(typeof result.context).toBe('string');
  });
});

describe('exchangeAuthorizationCode', () => {
  const mockTokenEndpoint = 'https://auth.example.com/token';
  const mockCode = 'auth-code';
  const mockClientId = 'client-id';
  const mockClientSecret = 'client-secret';
  const mockRedirectUri = 'https://app.example.com/callback';

  afterEach(() => {
    nock.cleanAll();
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
      `${mockClientId}:${mockClientSecret}`,
      'utf8'
    ).toString('base64')}`;

    nock('https://auth.example.com')
      .post('/token', {
        grant_type: 'authorization_code',
        code: mockCode,
        client_id: mockClientId,
        redirect_uri: mockRedirectUri,
      })
      .matchHeader('Authorization', expectedAuthHeader)
      .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
      .reply(200, JSON.stringify(mockResponse));

    const result = await exchangeAuthorizationCode(mockTokenEndpoint, {
      code: mockCode,
      clientId: mockClientId,
      clientSecret: mockClientSecret,
      redirectUri: mockRedirectUri,
    });

    expect(result).toMatchObject({
      accessToken: mockResponse.access_token,
      tokenType: mockResponse.token_type,
      expiresIn: mockResponse.expires_in,
      scope: mockResponse.scope,
      idToken: mockResponse.id_token,
    });
  });

  it('should throw error when token response is invalid', async () => {
    nock('https://auth.example.com').post('/token').reply(200, { invalid: 'response' });

    await expect(
      exchangeAuthorizationCode(mockTokenEndpoint, {
        code: mockCode,
        clientId: mockClientId,
        clientSecret: mockClientSecret,
      })
    ).rejects.toMatchObject({
      code: 'oidc.invalid_token',
    });
  });
});

describe('getUserInfo', () => {
  const mockAccessToken = 'access-token';
  const mockUserinfoEndpoint = 'https://auth.example.com/userinfo';

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get user info successfully', async () => {
    const mockUserInfo = {
      sub: 'user123',
      email: 'user@example.com',
      name: 'Test User',
    };

    nock('https://auth.example.com')
      .get('/userinfo')
      .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
      .reply(200, mockUserInfo);

    const result = await getUserInfo(mockAccessToken, mockUserinfoEndpoint);
    expect(result).toMatchObject(mockUserInfo);
  });

  it('should throw error when user info response is invalid', async () => {
    nock('https://auth.example.com')
      .get('/userinfo')
      .matchHeader('Authorization', `Bearer ${mockAccessToken}`)
      .reply(200, { invalid: 'response' });

    await expect(getUserInfo(mockAccessToken, mockUserinfoEndpoint)).rejects.toMatchObject({
      code: 'oidc.invalid_request',
    });
  });
});

describe('setupSamlProviders', () => {
  it('should setup SAML providers with correct configuration', () => {
    const mockMetadata = '<EntityDescriptor>...</EntityDescriptor>';
    const mockPrivateKey = '-----BEGIN PRIVATE KEY-----...';
    const mockEntityId = 'https://sp.example.com';
    const mockAcsUrl = {
      binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      url: 'https://sp.example.com/acs',
    };

    const { idp, sp } = setupSamlProviders(mockMetadata, mockPrivateKey, mockEntityId, mockAcsUrl);

    expect(idp).toBeDefined();
    expect(sp).toBeDefined();
    expect(sp.entityMeta.getEntityID()).toBe(mockEntityId);
  });
});
