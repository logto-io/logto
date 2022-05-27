import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import WeChatConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';
import { WeChatConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<WeChatConfig>;

const weChatMethods = new WeChatConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(weChatMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await weChatMethods.getAuthorizationUri(
      'some_state',
      'http://localhost:3001/callback'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?appid=%3Capp-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code&scope=snsapi_login&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
  const parameters = new URLSearchParams({
    appid: '<app-id>',
    secret: '<app-secret>',
    code: 'code',
    grant_type: 'authorization_code',
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        access_token: 'access_token',
        openid: 'openid',
      });
    const { accessToken, openid } = await weChatMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
    expect(openid).toEqual('openid');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {});
    await expect(weChatMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('validateConfig', () => {
  it('should pass on valid config', async () => {
    await expect(
      weChatMethods.validateConfig({ appId: 'appId', appSecret: 'appSecret' })
    ).resolves.not.toThrow();
  });
  it('should throw on empty config', async () => {
    await expect(weChatMethods.validateConfig({})).rejects.toThrowError();
  });
  it('should throw when missing appSecret', async () => {
    await expect(weChatMethods.validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const userInfoEndpointUrl = new URL(userInfoEndpoint);
  const parameters = new URLSearchParams({ access_token: 'accessToken', openid: 'openid' });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(0, {
      unionid: 'this_is_an_arbitrary_wechat_union_id',
      headimgurl: 'https://github.com/images/error/octocat_happy.gif',
      nickname: 'wechat bot',
    });
    const socialUserInfo = await weChatMethods.getUserInfo({
      accessToken: 'accessToken',
      openid: 'openid',
    });
    expect(socialUserInfo).toMatchObject({
      id: 'this_is_an_arbitrary_wechat_union_id',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'wechat bot',
    });
  });

  it('throws error if `openid` is missing', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(0, {
      unionid: 'this_is_an_arbitrary_wechat_union_id',
      headimgurl: 'https://github.com/images/error/octocat_happy.gif',
      nickname: 'wechat bot',
    });
    await expect(weChatMethods.getUserInfo({ accessToken: 'accessToken' })).rejects.toMatchError(
      new Error('`openid` is required by WeChat API.')
    );
  });

  it('throws SocialAccessTokenInvalid error if errcode is 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_001 });
    await expect(
      weChatMethods.getUserInfo({ accessToken: 'accessToken', openid: 'openid' })
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(500);
    await expect(
      weChatMethods.getUserInfo({ accessToken: 'accessToken', openid: 'openid' })
    ).rejects.toThrow();
  });

  it('throws Error if request failed and errcode is not 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_003, errmsg: 'invalid openid' });
    await expect(
      weChatMethods.getUserInfo({ accessToken: 'accessToken', openid: 'openid' })
    ).rejects.toMatchError(new Error('invalid openid'));
  });

  it('throws SocialAccessTokenInvalid error if response code is 401', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(new URLSearchParams({ access_token: 'wrongAccessToken', openid: 'openid' }))
      .reply(401);
    await expect(
      weChatMethods.getUserInfo({ accessToken: 'wrongAccessToken', openid: 'openid' })
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
  });
});
