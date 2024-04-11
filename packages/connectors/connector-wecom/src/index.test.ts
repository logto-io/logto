import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpointInside,
  authorizationEndpointQrcode,
  userInfoEndpoint,
} from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

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
        redirectUri: 'http://localhost:3001/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    const userAgent = 'some_UA';
    const isWecom = userAgent.toLowerCase().includes('wxwork');
    const authorizationEndpoint = isWecom
      ? authorizationEndpointInside
      : authorizationEndpointQrcode;

    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?appid=%3Ccorp-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fcallback&response_type=code&scope=snsapi_userinfo&state=some_state&agentid=%3Cagent-id%3E#wechat_redirect`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
  const parameters = new URLSearchParams({
    corpid: '<corp-id>',
    corpsecret: '<app-secret>',
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        access_token: 'access_token',
      });
    const { accessToken } = await getAccessToken(mockedConfig);
    expect(accessToken).toEqual('access_token');
    // Expect(openid).toEqual('openid');
  });

  it('throws SocialAuthCodeInvalid error if errcode is 40029', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_029, errmsg: 'invalid code' });
    await expect(getAccessToken(mockedConfig)).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'invalid code')
    );
  });

  it('throws SocialAuthCodeInvalid error if errcode is 40163', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(true)
      .reply(200, { errcode: 40_163, errmsg: 'code been used' });
    await expect(getAccessToken(mockedConfig)).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid, 'code been used')
    );
  });

  it('throws error with message otherwise', async () => {
    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(true)
      .reply(200, { errcode: -1, errmsg: 'system error' });
    await expect(getAccessToken(mockedConfig)).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'system error',
        errcode: -1,
      })
    );
  });
});

const nockNoOpenIdAccessTokenResponse = () => {
  const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
  nock(accessTokenEndpointUrl.origin).get(accessTokenEndpointUrl.pathname).query(true).reply(200, {
    access_token: 'access_token',
  });
};

describe('getUserInfo', () => {
  beforeEach(() => {
    const accessTokenEndpointUrl = new URL(accessTokenEndpoint);
    const parameters = new URLSearchParams({
      corpid: '<corp-id>',
      corpsecret: '<app-secret>',
    });

    nock(accessTokenEndpointUrl.origin)
      .get(accessTokenEndpointUrl.pathname)
      .query(parameters)
      .reply(200, {
        access_token: 'access_token',
      });
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  const userInfoEndpointUrl = new URL(userInfoEndpoint);
  const parameters = new URLSearchParams({ access_token: 'access_token', code: 'code' });

  it('should get valid SocialUserInfo', async () => {
    const jsonResponse = Object.freeze({
      userid: 'wecom_id',
      foo: 'bar',
    });
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(0, jsonResponse);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo(
      {
        code: 'code',
      },
      vi.fn()
    );
    expect(socialUserInfo).toMatchObject({
      id: 'wecom_id',
      avatar: '',
      name: 'wecom_id',
      rawData: jsonResponse,
    });
  });

  it('throws General error if code not provided in input', async () => {
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({}, vi.fn())).rejects.toStrictEqual(
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
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
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
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid, 'invalid credential')
    );
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(500);
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toThrow();
  });

  it('throws Error if request failed and errcode is not 40001', async () => {
    nock(userInfoEndpointUrl.origin)
      .get(userInfoEndpointUrl.pathname)
      .query(parameters)
      .reply(200, { errcode: 40_003, errmsg: 'invalid openid' });
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.General, {
        errorDescription: 'invalid openid',
        errcode: 40_003,
      })
    );
  });

  it('throws SocialAccessTokenInvalid error if response code is 401', async () => {
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(parameters).reply(401);
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });
});
