import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import { AlipayNativeConnector } from '.';
import { alipayEndpoint } from './constant';
import { mockedAlipayNativeConfig, mockedAlipayNativeConfigWithValidPrivateKey } from './mock';
import { AlipayNativeConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AlipayNativeConfig>;

const alipayNativeMethods = new AlipayNativeConnector(getConnectorConfig);

describe('validateConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      alipayNativeMethods.validateConfig(mockedAlipayNativeConfig)
    ).resolves.not.toThrow();
  });

  it('should throw on empty config', async () => {
    await expect(alipayNativeMethods.validateConfig({})).rejects.toThrowError();
  });

  it('should throw when missing required properties', async () => {
    await expect(alipayNativeMethods.validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by state', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
    const authorizationUri = await alipayNativeMethods.getAuthorizationUri(
      'dummy-redirectUri',
      'dummy-state'
    );
    expect(authorizationUri).toBe('alipay://?app_id=2021000000000000');
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const alipayEndpointUrl = new URL(alipayEndpoint);

  it('should get an accessToken by exchanging with code', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    const response = await alipayNativeMethods.getAccessToken('code');
    const { accessToken } = response;
    expect(accessToken).toEqual('access_token');
  });

  it('should throw when accessToken is empty', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    await expect(alipayNativeMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });

  it('should fail with wrong code', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    await expect(alipayNativeMethods.getAccessToken('wrong_code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'Invalid code')
    );
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const alipayEndpointUrl = new URL(alipayEndpoint);

  it('should get userInfo with accessToken', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    const { id, name, avatar } = await alipayNativeMethods.getUserInfo({
      accessToken: 'access_token',
    });
    expect(id).toEqual('2088000000000000');
    expect(name).toEqual('PlayboyEric');
    expect(avatar).toEqual('https://www.alipay.com/xxx.jpg');
  });

  it('should throw with wrong accessToken', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    await expect(
      alipayNativeMethods.getUserInfo({ accessToken: 'wrong_access_token' })
    ).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, 'Invalid auth token')
    );
  });

  it('should throw General error with other response error codes', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    await expect(
      alipayNativeMethods.getUserInfo({ accessToken: 'wrong_access_token' })
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.General));
  });

  it('should throw with right accessToken but empty userInfo', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
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

    await expect(
      alipayNativeMethods.getUserInfo({ accessToken: 'access_token' })
    ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.InvalidResponse));
  });

  it('should throw with other request errors', async () => {
    jest
      .spyOn(alipayNativeMethods, 'getConfig')
      .mockResolvedValueOnce(mockedAlipayNativeConfigWithValidPrivateKey);
    nock(alipayEndpointUrl.origin).post(alipayEndpointUrl.pathname).query(true).reply(500);

    await expect(
      alipayNativeMethods.getUserInfo({ accessToken: 'access_token' })
    ).rejects.toThrow();
  });
});
