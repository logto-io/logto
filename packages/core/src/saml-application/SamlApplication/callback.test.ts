import { generateKeyPair, SignJWT, type JWTPayload } from 'jose';
import nock from 'nock';

import {
  createMockSamlApplicationDetails,
  createMockSamlEnvSet,
} from './__mocks__/saml-application.js';
import { SamlApplication } from './index.js';

const { privateKey, publicKey } = await generateKeyPair('ES256');
const mockUser = { sub: 'user123', auth_time: 1_700_000_000 };
const mockIssuer = 'https://issuer.example.com';
const mockEndpoint = 'https://auth.example.com';
const mockSamlApplicationId = 'saml-app-id';
const envSet = createMockSamlEnvSet({ issuer: mockIssuer, localJWKSet: async () => publicKey });
const samlApp = new SamlApplication(
  createMockSamlApplicationDetails(),
  mockSamlApplicationId,
  envSet
);

beforeEach(() => {
  nock(mockIssuer)
    .get('/.well-known/openid-configuration')
    .reply(200, {
      token_endpoint: `${mockEndpoint}/token`,
      authorization_endpoint: `${mockEndpoint}/auth`,
      userinfo_endpoint: `${mockEndpoint}/userinfo`,
      jwks_uri: `${mockEndpoint}/jwks`,
      issuer: mockIssuer,
    });
});

const createIdToken = async (claims: JWTPayload = {}) =>
  new SignJWT({
    sub: mockUser.sub,
    iss: mockIssuer,
    aud: mockSamlApplicationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300,
    auth_time: mockUser.auth_time,
    ...claims,
  })
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey);

const mockCallback = (idToken: string, sub = mockUser.sub) => {
  nock(mockEndpoint).post('/token').reply(200, {
    access_token: 'access-token',
    id_token: idToken,
  });
  // UserInfo must not override the verified authentication time.
  nock(mockEndpoint)
    .get('/userinfo')
    .reply(200, { ...mockUser, sub, auth_time: 0 });
};

describe('handleOidcCallbackAndGetUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('uses auth_time from the verified ID token', async () => {
    mockCallback(await createIdToken());
    await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).resolves.toMatchObject(
      {
        sub: mockUser.sub,
        auth_time: mockUser.auth_time,
      }
    );
  });

  it.each([undefined, '1700000000', -1, 1.5])('rejects invalid auth_time: %s', async (authTime) => {
    mockCallback(await createIdToken({ auth_time: authTime }));
    await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).rejects.toThrow();
  });

  it('rejects a UserInfo subject different from the ID token', async () => {
    mockCallback(await createIdToken(), 'another-user');
    await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).rejects.toThrow();
  });

  it.each([{ iss: 'another-issuer' }, { aud: 'another-app' }, { exp: 0 }])(
    'rejects invalid ID token claims: %j',
    async (claims) => {
      mockCallback(await createIdToken(claims));
      await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).rejects.toThrow();
    }
  );

  it('rejects an ID token signed by another key', async () => {
    const otherKeys = await generateKeyPair('ES256');
    const idToken = await new SignJWT({ auth_time: mockUser.auth_time })
      .setProtectedHeader({ alg: 'ES256' })
      .setSubject(mockUser.sub)
      .setIssuer(mockIssuer)
      .setAudience(mockSamlApplicationId)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(otherKeys.privateKey);
    mockCallback(idToken);
    await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).rejects.toThrow();
  });

  it('rejects a malformed ID token', async () => {
    mockCallback('invalid-token');
    await expect(samlApp.handleOidcCallbackAndGetUserInfo({ code: 'code' })).rejects.toThrow();
  });
});
