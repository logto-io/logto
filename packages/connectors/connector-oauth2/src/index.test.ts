import nock from 'nock';

import { mockConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockConfig);

const { default: createConnector } = await import('./index.js');

describe('getAuthorizationUri', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const setSession = vi.fn();
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3001/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      setSession
    );

    const { origin, pathname, searchParams } = new URL(authorizationUri);
    expect(origin + pathname).toEqual(mockConfig.authorizationEndpoint);
    expect(searchParams.get('client_id')).toEqual(mockConfig.clientId);
    expect(searchParams.get('redirect_uri')).toEqual('http://localhost:3001/callback');
    expect(searchParams.get('state')).toEqual('some_state');
    expect(searchParams.get('response_type')).toEqual('code');
  });
});

describe('getUserInfo', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid userInfo', async () => {
    const userId = 'userId';
    const tokenEndpointUrl = new URL(mockConfig.tokenEndpoint);
    nock(tokenEndpointUrl.origin)
      .post(tokenEndpointUrl.pathname)
      .query(true)
      .reply(
        200,
        JSON.stringify({
          access_token: 'access_token',
          token_type: 'bearer',
        })
      );
    const userInfoEndpointUrl = new URL(mockConfig.userInfoEndpoint);
    nock(userInfoEndpointUrl.origin).get(userInfoEndpointUrl.pathname).query(true).reply(200, {
      sub: userId,
      foo: 'bar',
    });
    const connector = await createConnector({ getConfig });
    const userInfo = await connector.getUserInfo(
      { code: 'code' },
      vi.fn().mockImplementationOnce(() => {
        return { redirectUri: 'http://localhost:3001/callback' };
      })
    );
    expect(userInfo).toStrictEqual({ id: userId, rawData: { sub: userId, foo: 'bar' } });
  });
});
