import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-core';
import { jwtVerify } from 'jose';

import createConnector from '.';
import { authorizationEndpoint } from './constant';
import { mockedConfig } from './mock';

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(),
}));

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri({
      state: 'some_state',
      redirectUri: 'http://localhost:3000/callback',
    });
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=&state=some_state&response_type=code+id_token&response_mode=fragment`
    );
  });
});

describe('getUserInfo', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should get user info from id token payload', async () => {
    const userId = 'userId';
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({ payload: { sub: userId } }));
    const connector = await createConnector({ getConfig });
    const userInfo = await connector.getUserInfo({ id_token: 'idToken' });
    expect(userInfo).toEqual({ id: userId });
  });

  it('should throw if id token is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({})).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, '{}')
    );
  });

  it('should throw if verify id token failed', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => {
      throw new Error('jwtVerify failed');
    });
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ id_token: 'id_token' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid)
    );
  });

  it('should throw if the id token payload does not contains sub', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({
      payload: { iat: 123_456 },
    }));
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ id_token: 'id_token' })).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid)
    );
  });
});
