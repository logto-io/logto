import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import WeChatNativeConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';
import { WeChatNativeConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<WeChatNativeConfig>;

const weChatNativeMethods = new WeChatNativeConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(weChatNativeMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri', async () => {
    const authorizationUri = await weChatNativeMethods.getAuthorizationUri({
      state: 'dummy-state',
      redirectUri: 'dummy-redirect-uri',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?app_id=%3Capp-id%3E&state=dummy-state`
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
    const { accessToken, openid } = await weChatNativeMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
    expect(openid).toEqual('openid');
  });

  it('throws SocialAuthCodeInvalid error if errcode is 40029', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_029, errmsg: 'invalid code' });
    await expect(weChatNativeMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });

  it('throws error if errcode is neither 40029 nor undefined', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(true)
      .reply(200, { errcode: 40_163, errmsg: 'invalid code' });
    await expect(weChatNativeMethods.getAccessToken('wrong_code')).rejects.toMatchError(
      new Error('invalid code')
    );
  });
});

describe('validateConfig', () => {
  it('should pass on valid config', async () => {
    await expect(
      weChatNativeMethods.validateConfig({ appId: 'appId', appSecret: 'appSecret' })
    ).resolves.not.toThrow();
  });
  it('should throw on empty config', async () => {
    await expect(weChatNativeMethods.validateConfig({})).rejects.toThrowError();
  });
  it('should throw when missing appSecret', async () => {
    await expect(weChatNativeMethods.validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

const nockNoOpenIdAccessTokenResponse = () => {
  const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
  const parameters = new URLSearchParams({
    appid: '<app-id>',
    secret: '<app-secret>',
    code: 'code',
    grant_type: 'authorization_code',
  });
  nock(accessTokenEndpointUrl.origin)
    .get(accessTokenEndpointUrl.pathname)
    .query(parameters)
    .reply(200, {
      access_token: 'access_token',
    });
};

describe('getUserInfo', () => {
  beforeEach(() => {
    const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
    const parameters = new URLSearchParams({
      appid: '<app-id>',
      secret: '<app-secret>',
      code: 'code',
      grant_type: 'authorization_code',
    });

    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        access_token: 'access_token',
        openid: 'openid',
      });
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const userInfoEndpointUrl = new URL(userInfoEndpoint);
  const parameters = new URLSearchParams({ access_token: 'access_token', openid: 'openid' });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(0, {
      unionid: 'this_is_an_arbitrary_wechat_union_id',
      headimgurl: 'https://github.com/images/error/octocat_happy.gif',
      nickname: 'wechat bot',
    });
    const socialUserInfo = await weChatNativeMethods.getUserInfo({ code: 'code' });
    expect(socialUserInfo).toMatchObject({
      id: 'this_is_an_arbitrary_wechat_union_id',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'wechat bot',
    });
  });

  it('throws error if `openid` is missing', async () => {
    nockNoOpenIdAccessTokenResponse();
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        errcode: 41_009,
        errmsg: 'missing openid',
      });
    await expect(weChatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new Error('missing openid')
    );
  });

  it('throws SocialAccessTokenInvalid error if errcode is 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_001, errmsg: 'invalid credential' });
    await expect(weChatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(500);
    await expect(weChatNativeMethods.getUserInfo({ code: 'code' })).rejects.toThrow();
  });

  it('throws Error if request failed and errcode is not 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_003, errmsg: 'invalid openid' });
    await expect(weChatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new Error('invalid openid')
    );
  });

  it('throws SocialAccessTokenInvalid error if response code is 401', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(401);
    await expect(weChatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });
});
