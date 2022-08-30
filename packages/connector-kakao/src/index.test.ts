import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-core';
import nock from 'nock';

import createConnector, { getAccessToken } from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

describe('kakao connector', () => {
  describe('getAuthorizationUri', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const connector = await createConnector({ getConfig });
      const authorizationUri = await connector.getAuthorizationUri({
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
      });
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&state=some_state`
      );
    });
  });

  describe('getAccessToken', () => {
    afterEach(() => {
      nock.cleanAll();
      jest.clearAllMocks();
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
      ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid));
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
      jest.clearAllMocks();
    });

    it('should get valid SocialUserInfo', async () => {
      nock(userInfoEndpoint)
        .post('')
        .reply(200, {
          id: 1_234_567_890,
          kakao_account: {
            is_email_valid: true,
            email: 'ruddbs5302@gmail.com',
            profile: {
              nickname: 'pemassi',
              profile_image_url: 'https://github.com/images/error/octocat_happy.gif',
              is_default_image: false,
            },
          },
        });
      const connector = await createConnector({ getConfig });
      const socialUserInfo = await connector.getUserInfo({
        code: 'code',
        redirectUri: 'redirectUri',
      });
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar: 'https://github.com/images/error/octocat_happy.gif',
        name: 'pemassi',
        email: 'ruddbs5302@gmail.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).post('').reply(401);
      const connector = await createConnector({ getConfig });
      await expect(connector.getUserInfo({ code: 'code', redirectUri: '' })).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
      );
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
        connector.getUserInfo({
          error: 'general_error',
          error_description: 'General error encountered.',
        })
      ).rejects.toMatchError(
        new ConnectorError(
          ConnectorErrorCodes.General,
          '{"error":"general_error","error_description":"General error encountered."}'
        )
      );
    });

    it('throws unrecognized error', async () => {
      nock(userInfoEndpoint).post('').reply(500);
      const connector = await createConnector({ getConfig });
      await expect(connector.getUserInfo({ code: 'code', redirectUri: '' })).rejects.toThrow();
    });
  });
});
