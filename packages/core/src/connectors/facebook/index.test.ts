import nock from 'nock';

import { validateConfig, getAuthorizationUri, getAccessToken, getUserInfo } from '.';
import { ConnectorError, ConnectorErrorCodes } from '../types';
import { getConnectorConfig } from '../utilities';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';

const clientId = 'client_id_value';
const clientSecret = 'client_secret_value';
const code = 'code';
const dummyRedirectUri = 'dummyRedirectUri';
const fields = 'id,name,email,picture';

jest.mock('../utilities');

beforeAll(() => {
  (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
    clientId,
    clientSecret,
  });
});

describe('facebook connector', () => {
  describe('validateConfig', () => {
    it('should pass on valid config', async () => {
      await expect(validateConfig({ clientId, clientSecret })).resolves.not.toThrow();
    });

    it('should throw on invalid config', async () => {
      await expect(validateConfig({})).rejects.toThrow();
      await expect(validateConfig({ clientId })).rejects.toThrow();
      await expect(validateConfig({ clientSecret })).rejects.toThrow();
    });
  });

  describe('getAuthorizationUri', () => {
    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const redirectUri = 'http://localhost:3000/callback';
      const state = 'some_state';
      const authorizationUri = await getAuthorizationUri(redirectUri, state);

      const encodedRedirectUri = encodeURIComponent(redirectUri);
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=${clientId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=email%2Cpublic_profile&state=${state}`
      );
    });
  });

  describe('getAccessToken', () => {
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

      const { accessToken } = await getAccessToken(code, dummyRedirectUri);
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

      await expect(getAccessToken(code, dummyRedirectUri)).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
      );
    });
  });

  describe('getUserInfo', () => {
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

      const socialUserInfo = await getUserInfo(code);
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar,
        name: 'monalisa octocat',
        email: 'octocat@facebook.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).get('').query({ fields }).reply(400);
      await expect(getUserInfo(code)).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).get('').reply(500);
      await expect(getUserInfo(code)).rejects.toThrow();
    });
  });
});
