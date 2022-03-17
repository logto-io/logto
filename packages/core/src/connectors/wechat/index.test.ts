import nock from 'nock';

import { getAccessToken, getAuthorizationUri, validateConfig, getUserInfo } from '.';
import { ConnectorError, ConnectorErrorCodes } from '../types';
import { getConnectorConfig } from '../utilities';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';

jest.mock('../utilities');

beforeAll(() => {
  (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
    appId: '<app-id>',
    appSecret: '<app-secret>',
  });
});

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await getAuthorizationUri(
      'http://localhost:3001/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?appid=%3Capp-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code&scope=snsapi_login&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint).get('').reply(200, {
      access_token: 'access_token',
      openid: 'openid',
    });
    const { accessToken, openid } = await getAccessToken('code');
    expect(accessToken).toEqual('access_token');
    expect(openid).toEqual('openid');
  });
  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint).get('').reply(200, {});
    await expect(getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('validateConfig', () => {
  it('should pass on valid config', async () => {
    await expect(validateConfig({ appId: 'appId', appSecret: 'appSecret' })).resolves.not.toThrow();
  });
  it('should throw on empty config', async () => {
    await expect(validateConfig({})).rejects.toThrowError();
  });
  it('should throw when missing appSecret', async () => {
    await expect(validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      unionid: 'this_is_an_arbitrary_wechat_union_id',
      headimgurl:
        'https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0',
      nickname: 'wechat bot',
    });
    const socialUserInfo = await getUserInfo({ accessToken: 'accessToken', openid: 'openid' });
    expect(socialUserInfo).toMatchObject({
      id: 'this_is_an_arbitrary_wechat_union_id',
      avatar:
        'https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0',
      name: 'wechat bot',
    });
  });
  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    await expect(
      getUserInfo({ accessToken: 'accessToken', openid: 'openid' })
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
  });
  it('throws General ConnectorError if both openid and unionid are missing', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      headimgurl:
        'https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0',
      nickname: 'wechat bot',
    });
    await expect(getUserInfo({ accessToken: 'accessToken' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General)
    );
  });
  it('throws unrecognized error', async () => {
    nock(userInfoEndpoint).get('').reply(500);
    await expect(getUserInfo({ accessToken: 'accessToken', openid: 'openid' })).rejects.toThrow();
  });
});
