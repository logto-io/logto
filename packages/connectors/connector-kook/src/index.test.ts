import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('Kook connector', () => {
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
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=get_user_info&state=some_state`
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
        access_token: 'access_token',
        scope: 'scope',
        token_type: 'token_type',
        expires_in: 3600,
      });

      const { accessToken } = await getAccessToken(mockedConfig, {
        code: 'code',
        redirectUri: 'dummyRedirectUri',
      });
      expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
      nock(accessTokenEndpoint).post('').reply(200, {
        access_token: '',
        scope: 'scope',
        token_type: 'token_type',
        expires_in: 3600,
      });

      await expect(
        getAccessToken(mockedConfig, { code: 'code', redirectUri: 'dummyRedirectUri' })
      ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));
    });
  });

  describe('getUserInfo', () => {
    beforeEach(() => {
      nock(accessTokenEndpoint).post('').reply(200, {
        access_token: 'access_token',
        scope: 'scope',
        token_type: 'token_type',
        expires_in: 3600,
      });
    });

    afterEach(() => {
      nock.cleanAll();
      vi.clearAllMocks();
    });

    it('should get valid SocialUserInfo', async () => {
      nock(userInfoEndpoint)
        .get('')
        .reply(200, {
          code: 0,
          message: '操作成功',
          data: {
            id: '364862',
            username: 'test',
            identify_num: '1670',
            online: false,
            os: 'Websocket',
            status: 0,
            avatar: 'https://xxx.com/assets/bot.png/icon',
            banner: 'https://xxx.com/assets/banner.png',
            bot: false,
            mobile_verified: true,
            mobile_prefix: '86',
            mobile: '110****2333',
            invited_count: 0,
          },
        });
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo(
        {
          code: 'code',
          redirectUri: 'dummyRedirectUri',
        },
        vi.fn()
      );
      expect(socialUserInfo).toStrictEqual({
        id: '364862',
        name: 'test',
        avatar: 'https://xxx.com/assets/bot.png/icon',
        rawData: {
          id: '364862',
          username: 'test',
          identify_num: '1670',
          avatar: 'https://xxx.com/assets/bot.png/icon',
          banner: 'https://xxx.com/assets/banner.png',
          mobile_verified: true,
        },
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).get('').reply(401);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code: 'code', redirectUri: 'dummyRedirectUri' }, vi.fn())
      ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code: 'code', redirectUri: 'dummyRedirectUri' }, vi.fn())
      ).rejects.toThrow();
    });
  });
});
