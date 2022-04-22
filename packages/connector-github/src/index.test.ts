import {
  ConnectorError,
  ConnectorErrorCodes,
  GetConnectorConfig,
  GetTimeout,
} from '@logto/connector-types';
import nock from 'nock';

import { GithubConnector, GithubConfig } from '.';
import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant';

const mockedConfig = {
  clientId: '<client-id>',
  clientSecret: '<client-secret>',
};
const mockedTimeout = 5000;

const getConnectorConfig = jest.fn() as GetConnectorConfig<GithubConfig>;
const getConnectorRequestTimeout = jest.fn() as GetTimeout;

const githubMethods = new GithubConnector(getConnectorConfig, getConnectorRequestTimeout);

beforeAll(() => {
  jest.spyOn(githubMethods, 'getConfig').mockResolvedValue(mockedConfig);
  jest.spyOn(githubMethods, 'getRequestTimeout').mockResolvedValue(mockedTimeout);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await githubMethods.getAuthorizationUri(
      'http://localhost:3000/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=read%3Auser&state=some_state`
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
    const { accessToken } = await githubMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {});
    await expect(githubMethods.getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('validateConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      githubMethods.validateConfig({ clientId: 'clientId', clientSecret: 'clientSecret' })
    ).resolves.not.toThrow();
  });

  it('should throw on empty config', async () => {
    await expect(githubMethods.validateConfig({})).rejects.toThrowError();
  });

  it('should throw when missing clientSecret', async () => {
    await expect(githubMethods.validateConfig({ clientId: 'clientId' })).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
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
    const socialUserInfo = await githubMethods.getUserInfo({ accessToken: 'code' });
    expect(socialUserInfo).toMatchObject({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    await expect(githubMethods.getUserInfo({ accessToken: 'code' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpoint).get('').reply(500);
    await expect(githubMethods.getUserInfo({ accessToken: 'code' })).rejects.toThrow();
  });
});
