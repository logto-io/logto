import nock from 'nock';
import snakeCaseKeys from 'snakecase-keys';

import {
  AlipayConfig,
  validateConfig,
  signingPamameters,
  getAuthorizationUri,
  getAccessToken,
  getUserInfo,
} from '.';
import * as AlipayMethods from '.';
import { ConnectorError, ConnectorErrorCodes } from '../types';
import { getConnectorConfig, getFormattedDate } from '../utilities';
import {
  alipayEndpoint,
  authorizationEndpoint,
  methodForAccessToken,
  methodForUserInfo,
} from './constant';

jest.mock('../utilities');

beforeAll(() => {
  (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
    appId: '2021000000000000',
    charset: 'UTF8',
    signType: 'RSA2',
    privateKey: '<private-key>',
  });
  (getFormattedDate as jest.MockedFunction<typeof getFormattedDate>).mockReturnValue(
    '2022-02-22 22:22:22'
  );
});

describe('validateConfig', () => {
  it('should pass on valid config', async () => {
    await expect(
      validateConfig({ appId: 'appId', charset: 'UTF8', privateKey: 'privateKey', signType: 'RSA' })
    ).resolves.not.toThrow();
  });
  it('should throw on empty config', async () => {
    await expect(validateConfig({})).rejects.toThrowError();
  });
  it('should throw when missing required properties', async () => {
    await expect(validateConfig({ appId: 'appId' })).rejects.toThrowError();
  });
});

describe('signingParameters', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const mockedAlipayConfig: AlipayConfig = {
    appId: '2021000000000000',
    signType: 'RSA2',
    privateKey:
      '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC52SvnlRfzJJDR\nA1h4MX2JWV7Yt1j+1gvtQuLh0RYbE0AgRyz8CXFcJegO8gNyUQ05vrc1RMVzvNh8\njfjLpIX8an88KE4FyoG5P8NWrwPw5ZXOnzdvNxAV8QWOU+rT4WAdCsx4++mLlb5v\nGL18R77f3WLgY23bFtcGr9q7/qOaLzNxEe4idX1eLf7Ba/gQRY0awA55/Epd1Mi7\nLqTfxTd11PoBZQPe0vnuChp3P2l1MNpIJ5G1eQ4RXgI4UMClEbGRlBN7GUlXy5p7\ng6RtvOcwmBNoE4i0/HbvaanY3u7oenST3iSzEXa2hXMjnZPvg0G4Y5mq/V6XJPTh\nJrFc9XzFAgMBAAECggEAXfmNtN10LdN4kugBLU3BL9mMF0Om8b1kbIXc2djzN5+l\nVm0HNy7DLphQXnZL/ds0N9XTKFFtEpgUU+8qNjcsNTXYvp+WzGDY9cZjTQrUkFRX\nSxLBYjBSpvWoHI8ceCVHh4f1Wtvu/VEr6Vt2PUi+IM7+d35vh1BmTJBRp6wcKBMH\nXdfjWIi5z37pTXD3OTfUjBCtzA2DX0vY6UTsmD9UI0Mb6IJdT6qugiGODFdlsduA\nWJoZlXV1VbHcvGt7DoeQgzA45sr5siUnm+ntTVBHOR/hoZQrr0DY/O/MLKYUj/+r\nZMKKpx/7VHnWfMia2EOHfjW8vUlnraUzI+5E2/FzIQKBgQDgi7S7pfRux8YONGP2\nRtHPkF8d0YllsfKedhqF3cQlJ1dhxzVqHOi1IFn6ttuuYy5UsP5apYa2kj2UUPCa\nZGGi19Vnc+RHThpR4K6/OGFrpbINAgiVJLj7F8GXzqeA7W2ZHMp1R+oB+oTxih6t\nU0dbeTP01kbBV1/7+ZUKPhLE6QKBgQDT4cMgq01F/WIGGd1GUHZQjH5bqtNiJpIf\n2Q2OTw/gn1DVnwDXpHuXPxtC3NRoaRW/dTqsF6AAkMja3voPM3sYJurGBdU8pZPC\nquc9mqqu6TR5gX3KL1lSESvMBEgfLUy/f0gI3JNw1mG17pIhnXmOB2be3HfZPcj3\nwKWlluY/fQKBgDLll97c3A3sPGll2K6vGMmqmNTCdRlW/36JmLN1NAuT4kuoguP9\nj4XWwm6A2kSp+It73vue/20MsuaWfiMQ08y8jYO4kirTekXK3vE7D2H+GeC28EkW\nHNPVa61ES1V++9Oz4fQ5i8JNDatOOmvhL5B9ZZh+pWUXsAsGZJEAxvJZAoGAMPHO\n5GYN1KQil6wz3EFMA3Fg4wYEDIFCcg7uvbfvwACtaJtxU18QmbCfOIPQoUndFzwa\nUJSohljrvPuTIh3PSpX618GTL45EIszd2/I1iXAfig3qo+DqLjX/OwKmMmWBfB8H\n4dwqRv+O1LsGkLNS2AdHsSWWnd1S5kBfQ3AnQfUCgYACM8ldXZv7uGt9uZBmxile\nB0Hg5w7F1v9VD/m9ko+INAISz8OVkD83pCEoyHwlr20JjiF+yzAakOuq6rBi+l/V\n1veSiTDUcZhciuq1G178dFYepJqisFBu7bAM+WBS4agTTtxdSLZkHeS4VX+H3DOc\ntri43NXw6QS7uQ5/+2TsEw==\n-----END PRIVATE KEY-----',
  };
  const testingParameters = {
    code: '7ffeb112fbb6495c9e7dfb720380DD39',
    format: 'JSON',
    grantType: 'authorization_code',
    method: 'alipay.system.oauth.token',
    timestamp: '2022-02-22 22:22:22',
    version: '1.0',
    charset: 'UTF8',
    ...mockedAlipayConfig,
  };

  it('should return exact signature with the given parameters (functionality check)', () => {
    const decamelizedParameters = signingPamameters(testingParameters);
    expect(decamelizedParameters.sign).toBe(
      'td9+u0puul3HgbwLGL1X6z/vKKB/K25K5pjtLT/snQOp292RX3Y5j+FQUVuazTI2l65GpoSgA83LWNT9htQgtmdBmkCQ3bO6RWs38+2ZmBmH7MvpHx4ebUDhtebLUmHNuRFaNcpAZW92b0ZSuuJuahpLK8VNBgXljq+x0aD7WCRudPxc9fikR65NGxr5bwepl/9IqgMxwtajh1+PEJyhGGJhJxS1dCktGN0EiWXWNiogYT8NlFVCmw7epByKzCBWu4sPflU52gJMFHTdbav/0Tk/ZBs8RyP8Z8kcJA0jom2iT+dHqDpgkdzEmsR360UVNKCu5X7ltIiiObsAWmfluQ=='
    );
  });

  it('should not call JSON.parse() when biz_content is empty', () => {
    const spyJSONParse = jest.spyOn(JSON, 'parse');
    signingPamameters(testingParameters);
    expect(spyJSONParse).not.toHaveBeenCalled();
  });

  it('should call JSON.parse() when biz_content is not empty', () => {
    const spyJSONParse = jest.spyOn(JSON, 'parse');
    signingPamameters({ ...testingParameters, biz_content: JSON.stringify({ AB: 'AB' }) });
    expect(spyJSONParse).toHaveBeenCalled();
  });

  it('should call JSON.stringify() when some value is object string', () => {
    const spyJSONStringify = jest.spyOn(JSON, 'stringify');
    signingPamameters({ ...testingParameters, testObject: JSON.stringify({ AB: 'AB' }) });
    expect(spyJSONStringify).toHaveBeenCalled();
  });
});

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await getAuthorizationUri(
      'http://localhost:3001/callback',
      'some_state'
    );
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
  const parameters = new URLSearchParams(
    snakeCaseKeys({
      appId: '2021000000000000',
      charset: 'UTF8',
      signType: 'RSA2',
      privateKey: '<private-key>',
      method: methodForAccessToken,
      format: 'JSON',
      timestamp: '2022-02-22 22:22:22',
      version: '1.0',
      grantType: 'authorization_code',
      code: 'code',
      sign: 'sign',
    })
  );

  it('should get an accessToken by exchanging with code', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
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

    const { accessToken } = await getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });

  it('should throw when accessToken is empty', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
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

    await expect(getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });

  it('should fail with wrong code', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        error_response: {
          code: '20001',
          msg: 'Invalid code',
          sub_code: 'isv.code-invalid	',
        },
        sign: '<signature>',
      });

    await expect(getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  const alipayEndpointUrl = new URL(alipayEndpoint);
  const parameters = new URLSearchParams(
    snakeCaseKeys({
      appId: '2021000000000000',
      charset: 'UTF8',
      signType: 'RSA2',
      privateKey: '<private-key>',
      method: methodForUserInfo,
      format: 'JSON',
      timestamp: '2022-02-22 22:22:22',
      version: '1.0',
      grantType: 'authorization_code',
      auth_token: 'access_token',
      biz_content: '{}',
      sign: 'sign',
    })
  );

  it('should get userInfo with accessToken', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        alipay_user_info_share_response: {
          user_id: '2088000000000000',
          nick_name: 'PlayboyEric',
          avatar: 'https://www.alipay.com/xxx.jpg',
        },
        sign: '<signature>',
      });

    const { id, name, avatar } = await getUserInfo({ accessToken: 'access_token' });
    expect(id).toEqual('2088000000000000');
    expect(name).toEqual('PlayboyEric');
    expect(avatar).toEqual('https://www.alipay.com/xxx.jpg');
  });

  it('should throw with wrong accessToken', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        error_response: {
          code: '20001',
          msg: 'Invalid auth token',
          sub_code: 'aop.invalid-auth-token',
        },
        sign: '<signature>',
      });

    await expect(getUserInfo({ accessToken: 'access_token' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('should throw with right accessToken but empty userInfo', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin)
      .post(alipayEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        alipay_user_info_share_response: {
          user_id: undefined,
          nick_name: 'PlayboyEric',
          avatar: 'https://www.alipay.com/xxx.jpg',
        },
        sign: '<signature>',
      });

    await expect(getUserInfo({ accessToken: 'access_token' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('should throw with request 401 error', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin).post(alipayEndpointUrl.pathname).query(parameters).reply(401);

    await expect(getUserInfo({ accessToken: 'access_token' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('should throw with other request errors', async () => {
    jest.spyOn(AlipayMethods, 'signingPamameters').mockImplementationOnce((parameters) => {
      return snakeCaseKeys({ ...parameters, sign: 'sign' });
    });
    nock(alipayEndpointUrl.origin).post(alipayEndpointUrl.pathname).query(parameters).reply(400);

    await expect(getUserInfo({ accessToken: 'access_token' })).rejects.toThrow();
  });
});
