import nock from 'nock';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);
const setSession = vi.fn();
const getSession = vi.fn().mockResolvedValue({
  redirectUri: 'http://localhost:3000/callback',
});

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
      setSession
    );
    expect(setSession).toHaveBeenCalledWith({
      redirectUri: 'http://localhost:3000/callback',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?response_type=code&client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=profile&state=some_state`
    );
  });

  it('should get a valid uri with custom scope', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'custom_scope',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      setSession
    );
    expect(setSession).toHaveBeenCalledWith({
      redirectUri: 'http://localhost:3000/callback',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?response_type=code&client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=custom_scope&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {
      access_token: 'access_token',
    });
    const { access_token } = await getAccessToken(mockedConfig, 'code', 'redirectUri');
    expect(access_token).toEqual('access_token');
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint).post('').query(true).reply(200, {
      access_token: 'access_token',
    });
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      user_id: '1',
      name: 'monalisa',
      email: 'monalisa@example.com',
    });
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo(
      { code: 'code', redirectUri: 'http://localhost:3000/callback' },
      getSession
    );
    expect(socialUserInfo).toStrictEqual({
      id: '1',
      name: 'monalisa',
      email: 'monalisa@example.com',
      rawData: {
        user_id: '1',
        name: 'monalisa',
        email: 'monalisa@example.com',
      },
    });
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpoint).get('').reply(500);
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toThrow();
  });
});
