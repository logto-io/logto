import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('Dingtalk connector', () => {
  describe('getAuthorizationUri', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
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
        vi.fn()
      );
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=openid&state=some_state&prompt=consent`
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
        accessToken: 'accessToken',
        refreshToken: 'scope',
        expires_in: 7200,
        corpId: 'corpId',
      });

      const { accessToken } = await getAccessToken('code', mockedConfig);
      expect(accessToken).toEqual('accessToken');
    });
  });

  describe('getUserInfo', () => {
    beforeEach(() => {
      nock(accessTokenEndpoint).post('').reply(200, {
        accessToken: 'accessToken',
        refreshToken: 'scope',
        expires_in: 7200,
        corpId: 'corpId',
      });
    });

    afterEach(() => {
      nock.cleanAll();
      vi.clearAllMocks();
    });

    it('should get valid SocialUserInfo', async () => {
      nock(userInfoEndpoint).get('').reply(200, {
        nick: 'zhangsan',
        avatarUrl: 'https://xxx',
        mobile: '150xxxx9144',
        openId: '123',
        unionId: '123',
        email: 'zhangsan@alibaba-inc.com',
        stateCode: '86',
      });
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo(
        {
          code: 'code',
        },
        vi.fn()
      );
      expect(socialUserInfo).toStrictEqual({
        id: '123',
        avatar: 'https://xxx',
        email: 'zhangsan@alibaba-inc.com',
        name: 'zhangsan',
        phone: '86150xxxx9144',
        rawData: {
          nick: 'zhangsan',
          avatarUrl: 'https://xxx',
          mobile: '150xxxx9144',
          openId: '123',
          unionId: '123',
          email: 'zhangsan@alibaba-inc.com',
          stateCode: '86',
        },
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 400', async () => {
      nock(userInfoEndpoint).get('').reply(400);
      const connector = await createConnector({ getConfig });
      await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      const connector = await createConnector({ getConfig });
      await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toThrow();
    });
  });
});
