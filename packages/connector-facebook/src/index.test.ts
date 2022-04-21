import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  GetTimeout,
} from '@logto/connector-types';
import nock from 'nock';

import { FacebookConnector, FacebookConfig } from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';

const clientId = 'client_id_value';
const clientSecret = 'client_secret_value';
const code = 'code';
const dummyRedirectUri = 'dummyRedirectUri';
const fields = 'id,name,email,picture';

const mockedConfig = { clientId, clientSecret };
const mockedTimeout = 5000;

const getConnectorConfig = jest.fn() as GetConnectorConfig<FacebookConfig>;
const getConnectorRequestTimeout = jest.fn() as GetTimeout;

const FacebookMethods = new FacebookConnector(getConnectorConfig, getConnectorRequestTimeout);

beforeAll(() => {
  jest.spyOn(FacebookMethods, 'getConfig').mockResolvedValue(mockedConfig);
  jest.spyOn(FacebookMethods, 'getRequestTimeout').mockResolvedValue(mockedTimeout);
});

describe('facebook connector', () => {
  describe('validateConfig', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should pass on valid config', async () => {
      await expect(
        FacebookMethods.validateConfig({ clientId, clientSecret })
      ).resolves.not.toThrow();
    });

    it('should throw on invalid config', async () => {
      await expect(FacebookMethods.validateConfig({})).rejects.toThrow();
      await expect(FacebookMethods.validateConfig({ clientId })).rejects.toThrow();
      await expect(FacebookMethods.validateConfig({ clientSecret })).rejects.toThrow();
    });
  });

  describe('getAuthorizationUri', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = 'some_state';
      const authorizationUri = await FacebookMethods.getAuthorizationUri(redirectUri, state);

      const encodedRedirectUri = encodeURIComponent(redirectUri);
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=email%2Cpublic_profile&state=${state}`
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

      const { accessToken } = await FacebookMethods.getAccessToken(code, dummyRedirectUri);
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

      await expect(FacebookMethods.getAccessToken(code, dummyRedirectUri)).rejects.toMatchError(
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

      const socialUserInfo = await FacebookMethods.getUserInfo({ accessToken: code });
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar,
        name: 'monalisa octocat',
        email: 'octocat@facebook.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).get('').query({ fields }).reply(400);
      await expect(FacebookMethods.getUserInfo({ accessToken: code })).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      await expect(FacebookMethods.getUserInfo({ accessToken: code })).rejects.toThrow();
    });
  });
});
