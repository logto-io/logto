import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import { FacebookConnector } from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { clientId, clientSecret, code, dummyRedirectUri, fields, mockedConfig } from './mock';
import { FacebookConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<FacebookConfig>;

const facebookMethods = new FacebookConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(facebookMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('facebook connector', () => {
  describe('validateConfig', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should pass on valid config', async () => {
      await expect(
        facebookMethods.validateConfig({ clientId, clientSecret })
      ).resolves.not.toThrow();
    });

    it('should throw on invalid config', async () => {
      await expect(facebookMethods.validateConfig({})).rejects.toThrow();
      await expect(facebookMethods.validateConfig({ clientId })).rejects.toThrow();
      await expect(facebookMethods.validateConfig({ clientSecret })).rejects.toThrow();
    });
  });

  describe('getAuthorizationUri', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = 'some_state';
      const authorizationUri = await facebookMethods.getAuthorizationUri(redirectUri, state);

      const encodedRedirectUri = encodeURIComponent(redirectUri);
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&state=${state}&scope=email%2Cpublic_profile`
      );
    });
  });

  describe('getAccessToken', () => {
    afterEach(() => {
      nock.cleanAll();
      jest.clearAllMocks();
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
        });

      const { accessToken } = await facebookMethods.getAccessToken(code, dummyRedirectUri);
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
        .reply(200, {});

      await expect(facebookMethods.getAccessToken(code, dummyRedirectUri)).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
      );
    });
  });

  describe('getUserInfo', () => {
    afterEach(() => {
      nock.cleanAll();
      jest.clearAllMocks();
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

      const socialUserInfo = await facebookMethods.getUserInfo({ accessToken: code });
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar,
        name: 'monalisa octocat',
        email: 'octocat@facebook.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).get('').query({ fields }).reply(400);
      await expect(facebookMethods.getUserInfo({ accessToken: code })).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      await expect(facebookMethods.getUserInfo({ accessToken: code })).rejects.toThrow();
    });
  });
});
