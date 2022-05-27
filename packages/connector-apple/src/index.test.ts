import { GetConnectorConfig } from '@logto/connector-types';
import nock from 'nock';

import AppleConnector from '.';
import { defaultMetadata } from './constant';
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
      'some_state',
      'http://localhost:3000/callback'
    );
    expect(authorizationUri).toEqual(
      `${defaultMetadata.target}://?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it('should return code directly', async () => {
    const accessToken = await appleMethods.getAccessToken('code');
    expect(accessToken).toEqual('code');
  });
});

describe('validateConfig', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(appleMethods.validateConfig({ clientId: 'clientId' })).resolves.not.toThrow();
  });

  it('should throw on empty config', async () => {
    await expect(appleMethods.validateConfig({})).rejects.toThrowError();
  });
});

describe('getUserInfo', () => {
  // LOG-2726
});
