import nock from 'nock';

import { ConnectorError } from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  userInfoEndpoint,
  openIdEndpoint,
} from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import {
  mockedConfig,
  mockedAccessTokenResponse,
  mockedOpenIdAndUnionIdResponse,
  mockedUserInfoResponse,
} from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('getAuthorizationUri', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
        connectorId: 'connector_id',
        connectorFactoryId: 'connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?response_type=code&client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=get_user_info`
    );
  });

  it('should get a valid uri with custom scope', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'custom_scope',
        connectorId: 'connector_id',
        connectorFactoryId: 'connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?response_type=code&client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=custom_scope`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint).get('').query(true).reply(200, mockedAccessTokenResponse);

    const { accessToken } = await getAccessToken(
      mockedConfig,
      'code',
      'http://localhost:3000/callback'
    );
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint)
      .get('')
      .query(true)
      .reply(200, { error: 'invalid_grant', error_description: 'Invalid authorization code' });

    await expect(
      getAccessToken(mockedConfig, 'code', 'http://localhost:3000/callback')
    ).rejects.toThrow(ConnectorError);
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint).get('').query(true).reply(200, mockedAccessTokenResponse);

    nock(openIdEndpoint)
      .get('')
      .query(true)
      .reply(200, `callback(${JSON.stringify(mockedOpenIdAndUnionIdResponse)});`);
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').query(true).reply(200, mockedUserInfoResponse);

    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo(
      {
        code: 'valid_code',
        redirectUri: 'http://localhost:3000/callback',
      },
      vi.fn()
    );

    expect(socialUserInfo).toStrictEqual({
      id: 'unionid',
      avatar: 'https://example.com/example.jpg',
      name: 'nickname',
      rawData: mockedUserInfoResponse,
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 403', async () => {
    nock(userInfoEndpoint).get('').query(true).reply(403, {
      ret: 100_013,
      msg: 'access token invalid or expired',
    });

    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          code: 'code',
          redirectUri: 'http://localhost:3000/callback',
        },
        vi.fn()
      )
    ).rejects.toThrow();
  });

  it('throws General error if ret is not 0', async () => {
    const errorResponse = {
      ret: 100_016,
      msg: 'access token check failed',
    };

    nock(userInfoEndpoint).get('').query(true).reply(200, errorResponse);

    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          code: 'code',
          redirectUri: 'http://localhost:3000/callback',
        },
        vi.fn()
      )
    ).rejects.toThrow();
  });
});
