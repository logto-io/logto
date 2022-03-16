import nock from 'nock';

import { validateConfig, getAuthorizationUri, getAccessToken, getUserInfo } from '.';
import { ConnectorError, ConnectorErrorCodes } from '../types';
import { getConnectorConfig } from '../utilities';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';

jest.mock('../utilities');

beforeAll(() => {
  (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
    clientId: '<client-id>',
    clientSecret: '<client-secret>',
  });
});

describe('google connector', () => {
  describe('validateConfig', () => {
    it('should pass on valid config', async () => {
      await expect(
        validateConfig({ clientId: 'clientId', clientSecret: 'clientSecret' })
      ).resolves.not.toThrow();
    });

    it('should throw on invalid config', async () => {
      await expect(validateConfig({})).rejects.toThrow();
      await expect(validateConfig({ clientId: 'clientId' })).rejects.toThrow();
      await expect(validateConfig({ clientSecret: 'clientSecret' })).rejects.toThrow();
    });
  });

  describe('getAuthorizationUri', () => {
    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const authorizationUri = await getAuthorizationUri(
        'http://localhost:3000/callback',
        'some_state'
      );
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=openid%20profile%20email&state=some_state`
      );
    });
  });

  describe('getAccessToken', () => {
    it('should get an accessToken by exchanging with code', async () => {
      nock(accessTokenEndpoint).post('').reply(200, {
        access_token: 'access_token',
        scope: 'scope',
        token_type: 'token_type',
      });
      const { accessToken } = await getAccessToken('code', 'dummyRedirectUri');
      expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
      nock(accessTokenEndpoint).post('').reply(200, {});
      await expect(getAccessToken('code', 'dummyRedirectUri')).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
      );
    });
  });

  describe('getUserInfo', () => {
    it('should get valid SocialUserInfo', async () => {
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
      const socialUserInfo = await getUserInfo('code');
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar: 'https://github.com/images/error/octocat_happy.gif',
        name: 'monalisa octocat',
        email: 'octocat@google.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).post('').reply(401);
      await expect(getUserInfo('code')).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).post('').reply(500);
      await expect(getUserInfo('code')).rejects.toThrow();
    });
  });
});
