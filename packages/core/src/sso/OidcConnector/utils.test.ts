import { createMockUtils } from '@logto/shared/esm';
import camelcaseKeys from 'camelcase-keys';

import {
  SsoConnectorConfigErrorCodes,
  SsoConnectorError,
  SsoConnectorErrorCodes,
} from '../types/error.js';
import {
  oidcConfigResponseGuard,
  oidcAuthorizationResponseGuard,
  oidcTokenResponseGuard,
} from '../types/oidc.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);
const getMock = jest.fn();
const postMock = jest.fn();

class MockHttpError {
  constructor(public response: { body: unknown }) {}
}

mockEsm('got', () => ({
  got: {
    get: getMock,
    post: postMock,
  },
  HTTPError: MockHttpError,
}));

const { fetchOidcConfig, fetchToken } = await import('./utils.js');

const issuer = 'https://example.com';
const oidcConfig = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  scope: 'openid',
  issuer,
};
const oidcConfigResponse = {
  token_endpoint: 'https://example.com/token',
  authorization_endpoint: 'https://example.com/authorize',
  userinfo_endpoint: 'https://example.com/userinfo',
  jwks_uri: 'https://example.com/jwks',
  issuer,
};
const oidcConfigResponseCamelCase = camelcaseKeys(oidcConfigResponse);

describe('fetchOidcConfig', () => {
  it('should throw connector error if the discovery endpoint is not found', async () => {
    getMock.mockRejectedValueOnce(new MockHttpError({ body: 'invalid endpoint' }));

    await expect(fetchOidcConfig(issuer)).rejects.toMatchError(
      new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: { issuer },
        message: SsoConnectorConfigErrorCodes.FailToFetchConfig,
        error: 'invalid endpoint',
      })
    );
    expect(getMock).toBeCalledWith(`${issuer}/.well-known/openid-configuration`, {
      responseType: 'json',
    });
  });

  it('should throw connector error if the discovery endpoint returns invalid config', async () => {
    const body = {
      token_endpoint: 'https://example.com/token',
    };

    getMock.mockResolvedValueOnce({
      body,
    });

    const result = oidcConfigResponseGuard.safeParse(body);

    if (result.success) {
      throw new Error('invalid test case');
    }

    await expect(fetchOidcConfig(issuer)).rejects.toMatchError(
      new SsoConnectorError(SsoConnectorErrorCodes.InvalidConfig, {
        config: { issuer },
        message: SsoConnectorConfigErrorCodes.InvalidConfigResponse,
        error: result.error.flatten(),
      })
    );
  });

  it('should return the config if the discovery endpoint returns valid config', async () => {
    getMock.mockResolvedValueOnce({
      body: oidcConfigResponse,
    });

    await expect(fetchOidcConfig(issuer)).resolves.toEqual(oidcConfigResponseCamelCase);
  });
});

describe('fetchToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const redirectUri = 'https://example.com/callback';
  const data = {
    code: 'code',
    state: 'state',
  };
  const tokenResponse = {
    id_token: 'id_token',
    access_token: 'access_token',
    expires_in: 3600,
  };

  it('should throw connector error if the authorization response data is not valid', async () => {
    const data = {};
    const result = oidcAuthorizationResponseGuard.safeParse(data);

    if (result.success) {
      throw new Error('invalid test case');
    }

    await expect(
      fetchToken(
        {
          ...oidcConfig,
          ...oidcConfigResponseCamelCase,
        },
        data,
        redirectUri
      )
    ).rejects.toMatchError(
      new SsoConnectorError(SsoConnectorErrorCodes.InvalidRequestParameters, {
        url: oidcConfigResponseCamelCase.tokenEndpoint,
        params: data,
        error: result.error.flatten(),
      })
    );

    expect(postMock).not.toBeCalled();
  });

  it('should throw connector error if the token endpoint throws HTTPError', async () => {
    postMock.mockRejectedValueOnce(new MockHttpError({ body: 'invalid response' }));

    await expect(
      fetchToken(
        {
          ...oidcConfig,
          ...oidcConfigResponseCamelCase,
        },
        data,
        redirectUri
      )
    ).rejects.toMatchError(
      new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Fail to fetch token',
        error: 'invalid response',
      })
    );

    expect(postMock).toBeCalledWith(oidcConfigResponseCamelCase.tokenEndpoint, {
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: data.code,
        redirect_uri: redirectUri,
      }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${oidcConfig.clientId}:${oidcConfig.clientSecret}`,
          'utf8'
        ).toString('base64')}`,
      },
    });
  });

  it('should throw connector error if the token endpoint does not return id_token', async () => {
    const body = { refresh_token: 'refresh_token' };
    const result = oidcTokenResponseGuard.safeParse(body);

    if (result.success) {
      throw new Error('invalid test case');
    }

    postMock.mockResolvedValueOnce({
      body: JSON.stringify(body),
    });

    await expect(
      fetchToken(
        {
          ...oidcConfig,
          ...oidcConfigResponseCamelCase,
        },
        data,
        redirectUri
      )
    ).rejects.toMatchError(
      new SsoConnectorError(SsoConnectorErrorCodes.AuthorizationFailed, {
        message: 'Invalid token response',
        response: JSON.stringify(body),
        error: result.error.flatten(),
      })
    );
  });

  it('should return the token response if the token endpoint returns valid response', async () => {
    postMock.mockResolvedValueOnce({
      body: JSON.stringify(tokenResponse),
    });

    await expect(
      fetchToken(
        {
          ...oidcConfig,
          ...oidcConfigResponseCamelCase,
        },
        data,
        redirectUri
      )
    ).resolves.toEqual(tokenResponse);
  });
});
