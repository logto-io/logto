import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { accessTokenEndpoint, authorizationEndpoint, userInfoEndpoint } from './constant.js'; // Adjusted for Patreon
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

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
        redirectUri: 'http://localhost:3000/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      setSession
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?response_type=code&client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=identity+identity%5Bemail%5D` // Adjusted scope for Patreon
    );
  });
});

describe('getAccessToken', () => {
  const redirectUri = 'http://localhost/callback';
  afterEach(() => {
    nock.cleanAll(); // Clean up after each test to avoid interference
  });

  it('should get an accessToken by exchanging with code', async () => {
    const paramsObject = { code: 'test_code', redirectUri };

    // Mock the successful response
    nock(accessTokenEndpoint)
      .post('')
      .query({
        grant_type: 'authorization_code',
        client_id: mockedConfig.clientId,
        client_secret: mockedConfig.clientSecret,
        code: 'test_code',
        redirect_uri: redirectUri,
      })
      .reply(200, {
        access_token: 'mocked_access_token',
        token_type: 'Bearer',
        scope: 'identity',
      });

    const { accessToken } = await getAccessToken(mockedConfig, paramsObject);
    expect(accessToken).toEqual('mocked_access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    // Mock the successful response
    nock(accessTokenEndpoint)
      .post('')
      .query({
        grant_type: 'authorization_code',
        client_id: '<client-id>',
        client_secret: '<client-secret>',
        code: 'code',
        redirect_uri: 'http://localhost/callback',
      })
      .reply(200, {
        access_token: '',
        token_type: 'token_type',
        scope: 'scope',
      });
    await expect(getAccessToken(mockedConfig, { code: 'code', redirectUri })).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint).post('').query(true).reply(200, {
      access_token: 'access_token',
      token_type: 'token_type',
      scope: 'scope',
    });
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint)
      .get('')
      .reply(200, {
        data: {
          id: '12345',
          attributes: {
            full_name: 'Jane Doe',
            vanity: 'janedoe',
            url: 'https://www.patreon.com/janedoe',
            image_url: 'https://c10.patreon.com/2/400/12345',
            email: 'janedoe@example.com',
            is_email_verified: true,
            created: '2020-01-01T12:00:00Z',
          },
        },
      });
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo(
      { code: 'code' },
      vi.fn().mockImplementationOnce(() => {
        return { redirectUri: 'http://localhost:3001/callback' };
      })
    );
    expect(socialUserInfo).toStrictEqual({
      id: '12345',
      avatar: 'https://c10.patreon.com/2/400/12345',
      name: 'Jane Doe',
      email: 'janedoe@example.com',
      email_verified: true,
      profile: 'https://www.patreon.com/janedoe',
      preferred_username: 'janedoe',
      website: 'https://www.patreon.com/janedoe',
      rawData: {
        userInfo: {
          data: {
            id: '12345',
            attributes: {
              full_name: 'Jane Doe',
              vanity: 'janedoe',
              url: 'https://www.patreon.com/janedoe',
              image_url: 'https://c10.patreon.com/2/400/12345',
              email: 'janedoe@example.com',
              is_email_verified: true,
              created: '2020-01-01T12:00:00Z',
            },
          },
        },
      },
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        { code: 'code' },
        vi.fn().mockImplementationOnce(() => {
          return { redirectUri: 'http://localhost:3001/callback' };
        })
      )
    ).rejects.toStrictEqual(new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid));
  });

  it('throws AuthorizationFailed error if error is access_denied', async () => {
    nock(userInfoEndpoint)
      .get('')
      .reply(200, {
        data: {
          id: '12345',
          attributes: {
            full_name: 'Jane Doe',
            email: 'janedoe@example.com',
          },
        },
      });
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          error: 'access_denied',
          error_description: 'The user has denied your application access.',
          error_uri:
            'https://www.patreon.com/policy/troubleshooting-authorization-request-errors#access-denied',
        },
        vi.fn().mockImplementationOnce(() => {
          return { redirectUri: 'http://localhost:3001/callback' };
        })
      )
    ).rejects.toStrictEqual(
      new ConnectorError(
        ConnectorErrorCodes.AuthorizationFailed,
        'The user has denied your application access.'
      )
    );
  });

  it('throws General error if error is not access_denied', async () => {
    nock(userInfoEndpoint)
      .get('')
      .reply(200, {
        data: {
          id: '12345',
          attributes: {
            full_name: 'Jane Doe',
            email: 'janedoe@example.com',
          },
        },
      });
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          error: 'general_error',
          error_description: 'General error encountered.',
        },
        vi.fn().mockImplementationOnce(() => {
          return { redirectUri: 'http://localhost:3001/callback' };
        })
      )
    ).rejects.toStrictEqual(
      new ConnectorError(
        ConnectorErrorCodes.General,
        '{"error":"general_error","error_description":"General error encountered."}'
      )
    );
  });

  it('throws unrecognized error', async () => {
    nock(userInfoEndpoint).get('').reply(500);
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        { code: 'code' },
        vi.fn().mockImplementationOnce(() => {
          return { redirectUri: 'http://localhost:3001/callback' };
        })
      )
    ).rejects.toThrow();
  });
});
