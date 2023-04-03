import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { mockedConfig } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

const jwtVerify = jest.fn();

jest.unstable_mockModule('jose', () => ({
  jwtVerify,
  createRemoteJWKSet: jest.fn(),
}));

const { authorizationEndpoint } = await import('./constant.js');
const { default: createConnector } = await import('./index.js');

describe('getAuthorizationUri', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const setSession = jest.fn();
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      setSession
    );

    const { origin, pathname, searchParams } = new URL(authorizationUri);
    expect(origin + pathname).toEqual(authorizationEndpoint);
    expect(searchParams.get('client_id')).toEqual('<client-id>');
    expect(searchParams.get('redirect_uri')).toEqual('http://localhost:3000/callback');
    expect(searchParams.get('state')).toEqual('some_state');
    expect(searchParams.get('response_type')).toEqual('code id_token');
    expect(searchParams.get('response_mode')).toEqual('fragment');
    expect(searchParams.has('scope')).toBeTruthy();
    expect(searchParams.has('nonce')).toBeTruthy();
  });
});

describe('getUserInfo', () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should get user info from id token payload', async () => {
    const userId = 'userId';
    const mockJwtVerify = jwtVerify;
    mockJwtVerify.mockImplementationOnce(() => ({ payload: { sub: userId } }));
    const connector = await createConnector({ getConfig });
    const userInfo = await connector.getUserInfo({ id_token: 'idToken' }, jest.fn());
    expect(userInfo).toEqual({ id: userId });
  });

  it('should throw if id token is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({}, jest.fn())).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.General, '{}')
    );
  });

  it('should throw if verify id token failed', async () => {
    const mockJwtVerify = jwtVerify;
    mockJwtVerify.mockImplementationOnce(() => {
      throw new Error('jwtVerify failed');
    });
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ id_token: 'id_token' }, jest.fn())).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid)
    );
  });

  it('should throw if the id token payload does not contains sub', async () => {
    const mockJwtVerify = jwtVerify;
    mockJwtVerify.mockImplementationOnce(() => ({
      payload: { iat: 123_456 },
    }));
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ id_token: 'id_token' }, jest.fn())).rejects.toMatchError(
      new ConnectorError(ConnectorErrorCodes.SocialIdTokenInvalid)
    );
  });
});
