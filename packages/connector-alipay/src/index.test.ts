import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import AlipayConnector from '.';
import { alipayEndpoint, authorizationEndpoint } from './constant';
import { mockedAlipayConfig, mockedAlipayConfigWithValidPrivateKey } from './mock';
import { AlipayConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AlipayConfig>;

const alipayMethods = new AlipayConnector(getConnectorConfig);

describe('validateConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      alipayMethods.validateConfig({ appId: 'appId', privateKey: 'privateKey', signType: 'RSA' })
    ).resolves.not.toThrow();
  });

  it('should throw on empty config', async () => {
    await expect(alipayMethods.validateConfig({})).rejects.toThrowError();
  });

  it('should throw when missing required properties', async () => {
    await expect(alipayMethods.validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    jest.spyOn(alipayMethods, 'getConfig').mockResolvedValueOnce(mockedAlipayConfig);
    const authorizationUri = await alipayMethods.getAuthorizationUri({
      state: 'some_state',
      redirectUri: 'http://localhost:3001/callback',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?app_id=2021000000000000&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&scope=auth_user&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const alipayEndpointUrl = new URL(alipayEndpoint);

  it('should get an accessToken by exchanging with code', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_system_oauth_token_response: {
          user_id: '2088000000000000',
          access_token: 'access_token',
          expires_in: '3600',
          refresh_token: 'refresh_token',
          re_expires_in: '7200', // Expiring time of refresh token, in seconds
        },
        sign: '<signature>',
      });

    const response = await alipayMethods.getAccessToken(
      'code',
      mockedAlipayConfigWithValidPrivateKey
    );
    const { accessToken } = response;
    expect(accessToken).toEqual('access_token');
  });

  it('should throw when accessToken is empty', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_system_oauth_token_response: {
          user_id: '2088000000000000',
          access_token: undefined,
          expires_in: '3600',
          refresh_token: 'refresh_token',
          re_expires_in: '7200', // Expiring time of refresh token, in seconds
        },
        sign: '<signature>',
      });

    await expect(
      alipayMethods.getAccessToken('code', mockedAlipayConfigWithValidPrivateKey)
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));
  });

  it('should fail with wrong code', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        error_response: {
          code: '20001',
          msg: 'Invalid code',
          sub_code: 'isv.code-invalid	',
        },
        sign: '<signature>',
      });

    await expect(
      alipayMethods.getAccessToken('wrong_code', mockedAlipayConfigWithValidPrivateKey)
    ).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'Invalid code')
    );
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    jest.spyOn(alipayMethods, 'getConfig').mockResolvedValue(mockedAlipayConfigWithValidPrivateKey);
    jest.spyOn(alipayMethods, 'getAccessToken').mockResolvedValue({ accessToken: 'access_token' });
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const alipayEndpointUrl = new URL(alipayEndpoint);

  it('should get userInfo with accessToken', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_user_info_share_response: {
          code: '10000',
          msg: 'Success',
          user_id: '2088000000000000',
          nick_name: 'PlayboyEric',
          avatar: 'https://www.alipay.com/xxx.jpg',
        },
        sign: '<signature>',
      });

    const { id, name, avatar } = await alipayMethods.getUserInfo({ auth_code: 'code' });
    expect(id).toEqual('2088000000000000');
    expect(name).toEqual('PlayboyEric');
    expect(avatar).toEqual('https://www.alipay.com/xxx.jpg');
  });

  it('should throw with wrong accessToken', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_user_info_share_response: {
          code: '20001',
          msg: 'Invalid auth token',
          sub_code: 'aop.invalid-auth-token',
        },
        sign: '<signature>',
      });

    await expect(alipayMethods.getUserInfo({ auth_code: 'wrong_code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, 'Invalid auth token')
    );
  });

  it('should throw General error with other response error codes', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_user_info_share_response: {
          code: '40002',
          msg: 'Invalid parameter',
          sub_code: 'isv.invalid-parameter',
        },
        sign: '<signature>',
      });

    await expect(alipayMethods.getUserInfo({ auth_code: 'wrong_code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General)
    );
  });

  it('should throw with right accessToken but empty userInfo', async () => {
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(true)
      .reply(200, {
        alipay_user_info_share_response: {
          code: '10000',
          msg: 'Success',
          user_id: undefined,
          nick_name: 'PlayboyEric',
          avatar: 'https://www.alipay.com/xxx.jpg',
        },
        sign: '<signature>',
      });

    await expect(alipayMethods.getUserInfo({ auth_code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.InvalidResponse)
    );
  });

  it('should throw with other request errors', async () => {
    nock(alipayEndpointUrl.origin).post(alipayEndpointUrl.pathname).query(true).reply(500);

    await expect(alipayMethods.getUserInfo({ auth_code: 'code' })).rejects.toThrow();
  });
});
