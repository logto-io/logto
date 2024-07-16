import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn().mockReturnValue({
    getSigningKey: vi.fn().mockResolvedValue({
      publicKey: 'publicKey',
    }),
  }),
  jwtVerify: vi.fn().mockResolvedValue({
    payload: {
      sub: '1234567890',
      name: 'John Wick',
      given_name: 'John',
      family_name: 'Wick',
      email: 'john@silverhand.io',
      email_verified: true,
      picture: 'https://example.com/image.jpg',
    },
  }),
}));

describe('google connector', () => {
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
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&state=some_state&scope=openid+profile+email`
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
      });
      const { accessToken } = await getAccessToken(mockedConfig, {
        code: 'code',
        redirectUri: 'dummyRedirectUri',
      });
      expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
      nock(accessTokenEndpoint)
        .post('')
        .reply(200, { access_token: '', scope: 'scope', token_type: 'token_type' });
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
      });
    });

    afterEach(() => {
      nock.cleanAll();
      vi.clearAllMocks();
    });

    it('should get valid SocialUserInfo', async () => {
      const jsonResponse = Object.freeze({
        sub: '1234567890',
        name: 'monalisa octocat',
        given_name: 'monalisa',
        family_name: 'octocat',
        picture: 'https://github.com/images/error/octocat_happy.gif',
        email: 'octocat@google.com',
        email_verified: true,
        locale: 'en',
      });
      nock(userInfoEndpoint).post('').reply(200, jsonResponse);
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo(
        {
          code: 'code',
          redirectUri: 'redirectUri',
        },
        vi.fn()
      );
      expect(socialUserInfo).toStrictEqual({
        id: '1234567890',
        avatar: 'https://github.com/images/error/octocat_happy.gif',
        name: 'monalisa octocat',
        email: 'octocat@google.com',
        rawData: jsonResponse,
      });
    });

    it('should be able to decode ID token from Google One Tap', async () => {
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo(
        {
          credential: 'credential',
        },
        vi.fn()
      );
      expect(socialUserInfo).toStrictEqual({
        id: '1234567890',
        avatar: 'https://example.com/image.jpg',
        name: 'John Wick',
        email: 'john@silverhand.io',
        rawData: {
          sub: '1234567890',
          name: 'John Wick',
          given_name: 'John',
          family_name: 'Wick',
          email: 'john@silverhand.io',
          email_verified: true,
          picture: 'https://example.com/image.jpg',
        },
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).post('').reply(401);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code: 'code', redirectUri: '' }, vi.fn())
      ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
    });

    it('throws General error', async () => {
      nock(userInfoEndpoint).post('').reply(200, {
        sub: '1234567890',
        name: 'monalisa octocat',
        given_name: 'monalisa',
        family_name: 'octocat',
        picture: 'https://github.com/images/error/octocat_happy.gif',
        email: 'octocat@google.com',
        email_verified: true,
        locale: 'en',
      });
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo(
          {
            error: 'general_error',
            error_description: 'General error encountered.',
          },
          vi.fn()
        )
      ).rejects.toStrictEqual(
        new ConnectorError(
          ConnectorErrorCodes.General,
          '{"error":"general_error","error_description":"General error encountered."}'
        )
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).post('').reply(500);
      const connector = await createConnector({ getConfig });
      await expect(
        connector.getUserInfo({ code: 'code', redirectUri: '' }, vi.fn())
      ).rejects.toThrow();
    });
  });
});
