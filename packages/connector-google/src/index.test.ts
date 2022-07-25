import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-types';
import nock from 'nock';

import GoogleConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';
import { GoogleConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const googleMethods = new GoogleConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(googleMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('google connector', () => {
  describe('validateConfig', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    /**
     * Assertion functions always need explicit annotations.
     * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
     */

    it('should pass on valid config', async () => {
      const validator: ValidateConfig<GoogleConfig> = googleMethods.validateConfig;
      expect(() => {
        validator({ clientId: 'clientId', clientSecret: 'clientSecret' });
      }).not.toThrow();
    });

    it('should fail on invalid config', async () => {
      const validator: ValidateConfig<GoogleConfig> = googleMethods.validateConfig;
      expect(() => {
        validator({});
      }).toThrow();
      expect(() => {
        validator({ clientId: 'clientId' });
      }).toThrow();
      expect(() => {
        validator({ clientSecret: 'clientSecret' });
      }).toThrow();
    });
  });

  describe('getAuthorizationUri', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should get a valid authorizationUri with redirectUri and state', async () => {
      const authorizationUri = await googleMethods.getAuthorizationUri({
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
      });
      expect(authorizationUri).toEqual(
        `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&state=some_state&scope=openid+profile+email`
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
      const { accessToken } = await googleMethods.getAccessToken('code', 'dummyRedirectUri');
      expect(accessToken).toEqual('access_token');
    });

    it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
      nock(accessTokenEndpoint)
        .post('')
        .reply(200, { access_token: '', scope: 'scope', token_type: 'token_type' });
      await expect(googleMethods.getAccessToken('code', 'dummyRedirectUri')).rejects.toMatchError(
        new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
      );
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
      const socialUserInfo = await googleMethods.getUserInfo({ code: 'code', redirectUri: '' });
      expect(socialUserInfo).toMatchObject({
        id: '1234567890',
        avatar: 'https://github.com/images/error/octocat_happy.gif',
        name: 'monalisa octocat',
        email: 'octocat@google.com',
      });
    });

    it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
      nock(userInfoEndpoint).post('').reply(401);
      await expect(
        googleMethods.getUserInfo({ code: 'code', redirectUri: '' })
      ).rejects.toMatchError(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
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
      await expect(
        googleMethods.getUserInfo({
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
      await expect(googleMethods.getUserInfo({ code: 'code', redirectUri: '' })).rejects.toThrow();
    });
  });
});
