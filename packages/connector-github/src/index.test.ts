import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';
import * as qs from 'query-string';

import GithubConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';
import { mockedConfig } from './mock';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const githubMethods = new GithubConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(githubMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await githubMethods.getAuthorizationUri({
      state: 'some_state',
      redirectUri: 'http://localhost:3000/callback',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=read%3Auser`
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
      .post('')
      .reply(
        200,
        qs.stringify({
          access_token: 'access_token',
          scope: 'scope',
          token_type: 'token_type',
        })
      );
    const { accessToken } = await githubMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint)
      .post('')
      .reply(200, qs.stringify({ access_token: '', scope: 'scope', token_type: 'token_type' }));
    await expect(githubMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('validateConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: typeof githubMethods.validateConfig = githubMethods.validateConfig;
    expect(() => {
      validator({ clientId: 'clientId', clientSecret: 'clientSecret' });
    }).not.toThrow();
  });

  it('should fail on empty config', async () => {
    const validator: typeof githubMethods.validateConfig = githubMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });

  it('should fail when missing clientSecret', async () => {
    const validator: typeof githubMethods.validateConfig = githubMethods.validateConfig;
    expect(() => {
      validator({ clientId: 'clientId' });
    }).toThrow();
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint)
      .post('')
      .reply(
        200,
        qs.stringify({
          access_token: 'access_token',
          scope: 'scope',
          token_type: 'token_type',
        })
      );
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
    const socialUserInfo = await githubMethods.getUserInfo({ code: 'code' });
    expect(socialUserInfo).toMatchObject({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
  });

  it('should convert `null` to `undefined` in SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: null,
      name: null,
      email: null,
    });
    const socialUserInfo = await githubMethods.getUserInfo({ code: 'code' });
    expect(socialUserInfo).toMatchObject({
      id: '1',
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    await expect(githubMethods.getUserInfo({ code: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('throws AuthorizationFailed error if error is access_denied', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
    await expect(
      githubMethods.getUserInfo({
        error: 'access_denied',
        error_description: 'The user has denied your application access.',
        error_uri:
          'https://docs.github.com/apps/troubleshooting-authorization-request-errors#access-denied',
      })
    ).rejects.toMatchError(
      new ConnectorError(
        ConnectorErrorCodes.AuthorizationFailed,
        'The user has denied your application access.'
      )
    );
  });

  it('throws General error if error is not access_denied', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
    await expect(
      githubMethods.getUserInfo({
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
    nock(userInfoEndpoint).get('').reply(500);
    await expect(githubMethods.getUserInfo({ code: 'code' })).rejects.toThrow();
  });
});
