import nock from 'nock';

import { getAccessToken, getAuthorizationUri, validateConfig, getUserInfo } from '.';
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

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await getAuthorizationUri(
      'http://localhost:3000/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=read%3Auser&state=some_state`
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
    const accessToken = await getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });
  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {});
    await expect(getAccessToken('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('validateConfig', () => {
  it('should pass on valid config', async () => {
    await expect(
      validateConfig({ clientId: 'clientId', clientSecret: 'clientSecret' })
    ).resolves.not.toThrow();
  });
  it('should throw on empty config', async () => {
    // @ts-expect-error
    await expect(validateConfig()).rejects.toThrowError();
  });
  it('should throw when missing clientSecret', async () => {
    await expect(validateConfig({ clientId: 'clientId' })).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
  it('shoud get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
    const socialUserInfo = await getUserInfo('code');
    expect(socialUserInfo).toMatchObject({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
    });
  });
  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    await expect(getUserInfo('code')).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });
  it('throws unrecognized error', async () => {
    nock(userInfoEndpoint).get('').reply(500);
    await expect(getUserInfo('code')).rejects.toThrow();
  });
});
