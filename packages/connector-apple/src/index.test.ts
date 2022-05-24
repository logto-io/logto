import { ConnectorError, ConnectorErrorCodes, GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import AppleConnector from '.';
import { accessTokenEndpoint, authorizationEndpoint } from './constant';
import { mockedConfig } from './mock';
import { AppleConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AppleConfig>;

const appleMethods = new AppleConnector(getConnectorConfig);

beforeAll(() => {
  jest.spyOn(appleMethods, 'getConfig').mockResolvedValue(mockedConfig);
});

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await appleMethods.getAuthorizationUri(
      'http://localhost:3000/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=openid%20email%20name`
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
    const { accessToken } = await appleMethods.getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {});
    await expect(appleMethods.getAccessToken('code')).rejects.toMatchError(
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
      appleMethods.validateConfig({ clientId: 'clientId', clientSecret: 'clientSecret' })
    ).resolves.not.toThrow();
  });

  it('should throw on empty config', async () => {
    await expect(appleMethods.validateConfig({})).rejects.toThrowError();
  });

  it('should throw when missing clientSecret', async () => {
    await expect(appleMethods.validateConfig({ clientId: 'clientId' })).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  // TODO: add UTs for getUserInfo
});
