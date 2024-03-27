import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { clientId, clientSecret, code, dummyRedirectUri, fields, mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('Facebook connector', () => {
  describe('getAuthorizationUri', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = 'some_state';
      const connector = await createConnector({ getConfig });
      const authorizationUri = await connector.getAuthorizationUri(
        {
          state,
          redirectUri,
          connectorId: 'some_connector_id',
          connectorFactoryId: 'some_connector_factory_id',
          jti: 'some_jti',
          headers: {},
        },
        vi.fn()
      );

      const encodedRedirectUri = encodeURIComponent(redirectUri);
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&state=${state}&scope=email%2Cpublic_profile`
      );
    });
  });

  describe('getAccessToken', () => {
    afterEach(() => {
      nock.cleanAll();
      vi.clearAllMocks();
    });

    it('should get an accessToken by exchanging with code', async () => {
      nock(accessTokenEndpoint)
        .get('')
        .query({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: dummyRedirectUri,
        })
        .reply(200, {
          access_token: 'access_token',
          scope: 'scope',
          token_type: 'token_type',
          expires_in: 3600,
        });

      const { accessToken } = await getAccessToken(mockedConfig, {
        code,
        redirectUri: dummyRedirectUri,
      });
      expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
      nock(accessTokenEndpoint)
        .get('')
        .query({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: dummyRedirectUri,
        })
        .reply(200, {
          access_token: '',
          scope: 'scope',
          token_type: 'token_type',
          expires_in: 3600,
        });

      await expect(
        getAccessToken(mockedConfig, { code, redirectUri: dummyRedirectUri })
      ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));
    });
  });

  describe('getUserInfo', () => {
    beforeEach(() => {
      nock(accessTokenEndpoint)
        .get('')
        .query({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: dummyRedirectUri,
        })
        .reply(200, {
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
      const avatar = 'https://github.com/images/error/octocat_happy.gif';
      nock(userInfoEndpoint)
        .get('')
        .query({ fields })
        .reply(200, {
          id: '1234567890',
          name: 'monalisa octocat',
          email: 'octocat@facebook.com',
          picture: { data: { url: avatar } },
        });
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo(
        {
          code,
          redirectUri: dummyRedirectUri,
        },
        vi.fn()
      );
      expect(socialUserInfo).toStrictEqual({
        id: '1234567890',
        avatar,
        name: 'monalisa octocat',
        email: 'octocat@facebook.com',
        rawData: {
          id: '1234567890',
          name: 'monalisa octocat',
          email: 'octocat@facebook.com',
          picture: { data: { url: avatar } },
        },
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).get('').query({ fields }).reply(400);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code, redirectUri: dummyRedirectUri }, vi.fn())
      ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
    });

    it('throws AuthorizationFailed error if error is access_denied', async () => {
      const avatar = 'https://github.com/images/error/octocat_happy.gif';
      nock(userInfoEndpoint)
        .get('')
        .query({ fields })
        .reply(200, {
          id: '1234567890',
          name: 'monalisa octocat',
          email: 'octocat@facebook.com',
          picture: { data: { url: avatar } },
        });
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo(
          {
            error: 'access_denied',
            error_code: 200,
            error_description: 'Permissions error.',
            error_reason: 'user_denied',
          },
          vi.fn()
        )
      ).rejects.toStrictEqual(
        new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, 'Permissions error.')
      );
    });

    it('throws General error if error is not access_denied', async () => {
      const avatar = 'https://github.com/images/error/octocat_happy.gif';
      nock(userInfoEndpoint)
        .get('')
        .query({ fields })
        .reply(200, {
          id: '1234567890',
          name: 'monalisa octocat',
          email: 'octocat@facebook.com',
          picture: { data: { url: avatar } },
        });
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo(
          {
            error: 'general_error',
            error_code: 200,
            error_description: 'General error encountered.',
            error_reason: 'user_denied',
          },
          vi.fn()
        )
      ).rejects.toStrictEqual(
        new ConnectorError(ConnectorErrorCodes.General, {
          error: 'general_error',
          error_code: 200,
          errorDescription: 'General error encountered.',
          error_reason: 'user_denied',
        })
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code, redirectUri: dummyRedirectUri }, vi.fn())
      ).rejects.toThrow();
    });
  });
});
