import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig, mockedAccessTokenResponse, mockedUserInfoResponse } from './mock.js';

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
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&state=some_state&scope=1&skip_confirm=true`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint)
      .post('')
      .reply(200, `&&&START&&&${JSON.stringify(mockedAccessTokenResponse)}`);
    const { accessToken } = await getAccessToken(mockedConfig, { code: 'code' }, '');
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint).post('').reply(200, '&&&START&&&{"access_token":"","scope":"1"}');
    await expect(getAccessToken(mockedConfig, { code: 'code' }, '')).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint)
      .post('')
      .reply(200, `&&&START&&&${JSON.stringify(mockedAccessTokenResponse)}`);
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').query(true).reply(200, mockedUserInfoResponse);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, vi.fn());
    expect(socialUserInfo).toStrictEqual({
      id: 'union_id',
      avatar: 'https://avatar.example.com/user.jpg',
      name: 'Test User',
      rawData: mockedUserInfoResponse,
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').query(true).reply(401);
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });
});
