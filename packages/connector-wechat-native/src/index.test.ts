import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-schemas';
import nock from 'nock';

import WechatNativeConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';
import { WechatNativeConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const wechatNativeMethods = new WechatNativeConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(wechatNativeMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri', async () => {
    const authorizationUri = await wechatNativeMethods.getAuthorizationUri({
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
    const { accessToken, openid } = await wechatNativeMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
    expect(openid).toEqual('openid');
  });

  it('throws SocialAuthCodeInvalid error if errcode is 40029', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_029, errmsg: 'invalid code' });
    await expect(wechatNativeMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'invalid code')
    );
  });

  it('throws SocialAuthCodeInvalid error if errcode is 40163', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(true)
      .reply(200, { errcode: 40_163, errmsg: 'code been used' });
    await expect(wechatNativeMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'code been used')
    );
  });

  it('throws error with message otherwise', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(true)
      .reply(200, { errcode: -1, errmsg: 'system error' });
    await expect(wechatNativeMethods.getAccessToken('wrong_code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'system error',
        errcode: -1,
      })
    );
  });
});

describe('validateConfig', () => {
  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: ValidateConfig<WechatNativeConfig> = wechatNativeMethods.validateConfig;
    expect(() => {
      validator({ appId: 'appId', appSecret: 'appSecret' });
    }).not.toThrow();
  });

  it('should fail on empty config', async () => {
    const validator: ValidateConfig<WechatNativeConfig> = wechatNativeMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });

  it('should fail when missing appSecret', async () => {
    const validator: ValidateConfig<WechatNativeConfig> = wechatNativeMethods.validateConfig;
    expect(() => {
      validator({ appId: 'appId' });
    }).toThrow();
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
    const socialUserInfo = await wechatNativeMethods.getUserInfo({ code: 'code' });
    expect(socialUserInfo).toMatchObject({
      id: 'this_is_an_arbitrary_wechat_union_id',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'wechat bot',
    });
  });

  it('throws General error if code not provided in input', async () => {
    await expect(wechatNativeMethods.getUserInfo({})).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, '{}')
    );
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
    await expect(wechatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'missing openid',
        errcode: 41_009,
      })
    );
  });

  it('throws SocialAccessTokenInvalid error if errcode is 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_001, errmsg: 'invalid credential' });
    await expect(wechatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, 'invalid credential')
    );
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(500);
    await expect(wechatNativeMethods.getUserInfo({ code: 'code' })).rejects.toThrow();
  });

  it('throws Error if request failed and errcode is not 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_003, errmsg: 'invalid openid' });
    await expect(wechatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'invalid openid',
        errcode: 40_003,
      })
    );
  });

  it('throws SocialAccessTokenInvalid error if response code is 401', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(401);
    await expect(wechatNativeMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });
});
