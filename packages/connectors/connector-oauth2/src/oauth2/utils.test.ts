import nock from 'nock';

import ky from 'ky';

import { ClientSecretJwtSigningAlgorithm, TokenEndpointAuthMethod } from './types.js';
import { constructAuthorizationUri, type RequestTokenEndpointOptions } from './utils.js';

const kyPostMock = vi.spyOn(ky, 'post');

vi.mock('jose', () => ({
  SignJWT: vi.fn(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue('signed-jwt'),
  })),
}));

const { requestTokenEndpoint } = await import('./utils.js');

const tokenEndpointUrl = new URL('https://example.com/token');

describe('requestTokenEndpoint', () => {
  beforeEach(() => {
    nock(tokenEndpointUrl.origin)
      .post(tokenEndpointUrl.pathname)
      .query(true)
      .reply(
        200,
        JSON.stringify({
          access_token: 'access_token',
          token_type: 'bearer',
        })
      );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it('should handle TokenEndpointAuthMethod.ClientSecretJwt correctly', async () => {
    const options: RequestTokenEndpointOptions = {
      tokenEndpoint: 'https://example.com/token',
      tokenEndpointAuthOptions: {
        method: TokenEndpointAuthMethod.ClientSecretJwt,
        clientSecretJwtSigningAlgorithm: ClientSecretJwtSigningAlgorithm.HS256,
      },
      tokenRequestBody: {
        grantType: 'authorization_code',
        code: 'authcode123',
        redirectUri: 'https://example.com/callback',
        clientId: 'client123',
        clientSecret: 'secret123',
        extraParam: 'extra',
      },
      timeout: 5000,
    };

    await requestTokenEndpoint(options);
    expect(kyPostMock).toHaveBeenCalledWith(options.tokenEndpoint, {
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'authcode123',
        redirect_uri: 'https://example.com/callback',
        extra_param: 'extra',
        client_id: 'client123',
        client_assertion: 'signed-jwt',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      }),
      timeout: 5000,
    });
  });

  it('should handle TokenEndpointAuthMethod.ClientSecretBasic correctly', async () => {
    const options: RequestTokenEndpointOptions = {
      tokenEndpoint: 'https://example.com/token',
      tokenEndpointAuthOptions: {
        method: TokenEndpointAuthMethod.ClientSecretBasic,
      },
      tokenRequestBody: {
        grantType: 'authorization_code',
        code: 'authcode123',
        redirectUri: 'https://example.com/callback',
        clientId: 'client123',
        clientSecret: 'secret123',
        extraParam: 'extra',
      },
      timeout: 5000,
    };

    await requestTokenEndpoint(options);
    expect(kyPostMock).toHaveBeenCalledWith(options.tokenEndpoint, {
      headers: {
        Authorization: `Basic ${Buffer.from('client123:secret123').toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'authcode123',
        redirect_uri: 'https://example.com/callback',
        extra_param: 'extra',
      }),
      timeout: 5000,
    });
  });

  it('should handle TokenEndpointAuthMethod.ClientSecretPost correctly', async () => {
    const options: RequestTokenEndpointOptions = {
      tokenEndpoint: 'https://example.com/token',
      tokenEndpointAuthOptions: {
        method: TokenEndpointAuthMethod.ClientSecretPost,
      },
      tokenRequestBody: {
        grantType: 'authorization_code',
        code: 'authcode123',
        redirectUri: 'https://example.com/callback',
        clientId: 'client123',
        clientSecret: 'secret123',
        extraParam: 'extra',
      },
      timeout: 5000,
    };

    await requestTokenEndpoint(options);
    expect(kyPostMock).toHaveBeenCalledWith(options.tokenEndpoint, {
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: 'authcode123',
        redirect_uri: 'https://example.com/callback',
        client_id: 'client123',
        client_secret: 'secret123',
        extra_param: 'extra',
      }),
      timeout: 5000,
    });
  });
});

describe('constructAuthorizationUri', () => {
  it('constructs a valid authorization URL with all parameters', async () => {
    const authorizationEndpoint = 'https://example.com/oauth/authorize';
    const queryParameters = {
      responseType: 'code',
      clientId: 'client123',
      scope: 'openid email',
      redirectUri: 'https://example.com/callback',
      state: 'state123',
    };

    const expectedParams = new URLSearchParams({
      response_type: 'code',
      client_id: 'client123',
      scope: 'openid email',
      redirect_uri: 'https://example.com/callback',
      state: 'state123',
    }).toString();

    const result = constructAuthorizationUri(authorizationEndpoint, queryParameters);
    expect(result).toBe(`${authorizationEndpoint}?${expectedParams}`);
  });

  it('omits undefined values from the constructed URL', async () => {
    const authorizationEndpoint = 'https://example.com/oauth/authorize';
    const queryParameters = {
      responseType: 'code',
      clientId: 'client123',
      redirectUri: 'https://example.com/callback',
      state: 'state123',
      scope: undefined, // This should not appear in the final URL
    };

    const expectedParams = new URLSearchParams({
      response_type: 'code',
      client_id: 'client123',
      redirect_uri: 'https://example.com/callback',
      state: 'state123',
    }).toString();

    const result = constructAuthorizationUri(authorizationEndpoint, queryParameters);
    expect(result).toBe(`${authorizationEndpoint}?${expectedParams}`);
  });
});
