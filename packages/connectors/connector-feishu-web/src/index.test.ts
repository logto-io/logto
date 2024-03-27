import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, codeEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { buildAuthorizationUri, getAccessToken } from './index.js';
import { mockedFeishuConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedFeishuConfig);

describe('getAuthorizationUri', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should build authorization uri', function () {
    const url = buildAuthorizationUri('123', 'http://localhost:3000', '123');
    expect(url).toBe(
      `${codeEndpoint}?client_id=123&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&state=123`
    );
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3001/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toEqual(
      `${codeEndpoint}?client_id=1112233&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  const accessTokenUrl = new URL(accessTokenEndpoint);

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenUrl.origin).post(accessTokenUrl.pathname).query(true).reply(200, {
      access_token: 'some_access_token',
      token_type: 'Bearer',
      expires_in: 7200,
      refresh_token: 'some_refresh_token',
      refresh_expires_in: 7200,
    });
    const response = await getAccessToken('code', '123', '123', 'http://localhost:3000');
    const { accessToken } = response;
    expect(accessToken).toEqual('some_access_token');
  });

  it('should throw when accessToken is empty', async () => {
    nock(accessTokenUrl.origin).post(accessTokenUrl.pathname).query(true).reply(200, {
      access_token: '',
      token_type: 'Bearer',
      expires_in: 7200,
      refresh_token: 'some_refresh_token',
      refresh_expires_in: 7200,
    });

    await expect(
      getAccessToken('code', '123', '123', 'http://localhost:3000')
    ).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'access_token is empty')
    );
  });

  it('should fail with wrong code', async () => {
    nock(accessTokenUrl.origin).post(accessTokenUrl.pathname).query(true).reply(400, {
      error: 'invalid_grant',
      error_description: 'invalid code',
    });

    await expect(
      getAccessToken('code', '123', '123', 'http://localhost:3000')
    ).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'invalid code')
    );
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    nock(accessTokenUrl.origin).post(accessTokenUrl.pathname).query(true).reply(200, {
      access_token: 'some_access_token',
      token_type: 'Bearer',
      expires_in: 7200,
      refresh_token: 'some_refresh_token',
      refresh_expires_in: 7200,
    });
  });

  const userInfoUrl = new URL(userInfoEndpoint);
  const accessTokenUrl = new URL(accessTokenEndpoint);

  it('should get userInfo with accessToken', async () => {
    const jsonResponse = Object.freeze({
      sub: 'ou_caecc734c2e3328a62489fe0648c4b98779515d3',
      name: '李雷',
      picture: 'https://www.feishu.cn/avatar',
      open_id: 'ou_caecc734c2e3328a62489fe0648c4b98779515d3',
      union_id: 'on_d89jhsdhjsajkda7828enjdj328ydhhw3u43yjhdj',
      en_name: 'Lilei',
      tenant_key: '736588c92lxf175d',
      avatar_url: 'www.feishu.cn/avatar/icon',
      avatar_thumb: 'www.feishu.cn/avatar/icon_thumb',
      avatar_middle: 'www.feishu.cn/avatar/icon_middle',
      avatar_big: 'www.feishu.cn/avatar/icon_big',
      email: 'zhangsan@feishu.cn',
      user_id: '5d9bdxxx',
      employee_no: '111222333',
      mobile: '+86130xxxx0000',
    });
    nock(userInfoUrl.origin).get(userInfoUrl.pathname).query(true).once().reply(200, jsonResponse);

    const connector = await createConnector({ getConfig });
    const { id, name, avatar, rawData } = await connector.getUserInfo(
      {
        code: 'code',
        redirectUri: 'http://localhost:3000',
      },
      vi.fn()
    );
    expect(id).toEqual('ou_caecc734c2e3328a62489fe0648c4b98779515d3');
    expect(name).toEqual('李雷');
    expect(avatar).toEqual('www.feishu.cn/avatar/icon');
    expect(rawData).toEqual(jsonResponse);
  });

  it('throw General error if code not provided in input', async () => {
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({}, vi.fn())).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.InvalidResponse, '{}')
    );
  });

  it('should throw SocialAccessTokenInvalid with code invalid_token', async () => {
    nock(userInfoUrl.origin).get(userInfoUrl.pathname).query(true).reply(400, {
      error: 'invalid_token',
      error_description: 'invalid access token',
    });
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo({ code: 'error_code', redirectUri: 'http://localhost:3000' }, vi.fn())
    ).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, 'invalid access token')
    );
  });

  it('should throw with right accessToken but empty userInfo', async () => {
    nock(userInfoUrl.origin).get(userInfoUrl.pathname).query(true).reply(200, {
      sub: '',
    });
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo({ code: 'code', redirectUri: 'http://localhost:3000' }, vi.fn())
    ).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.InvalidResponse, 'invalid user response')
    );
  });

  it('should throw with other request errors', async () => {
    nock(userInfoUrl.origin).get(userInfoUrl.pathname).query(true).reply(500);
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo({ code: 'code', redirectUri: 'http://localhost:3000' }, vi.fn())
    ).rejects.toThrow();
  });
});
