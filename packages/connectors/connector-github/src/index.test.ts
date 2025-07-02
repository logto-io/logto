import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import {
  accessTokenEndpoint,
  authorizationEndpoint,
  userEmailsEndpoint,
  userInfoEndpoint,
} from './constant.js';
import createConnector, { getAccessToken } from './index.js';
import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('getAuthorizationUri', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get a valid uri by redirectUri and state', async () => {
    const connector = await createConnector({ getConfig });
    const authorizationUri = await connector.getAuthorizationUri(
      {
        state: 'some_state',
        redirectUri: 'http://localhost:3000/callback',
        connectorId: 'some_connector_id',
        connectorFactoryId: 'some_connector_factory_id',
        jti: 'some_jti',
        headers: {},
      },
      vi.fn()
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&state=some_state&scope=read%3Auser+user%3Aemail`
    );
  });
});

describe('getAccessToken', () => {
  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {
      access_token: 'access_token',
      scope: 'scope',
      token_type: 'token_type',
    });
    const { access_token: accessToken } = await getAccessToken(mockedConfig, { code: 'code' });
    expect(accessToken).toEqual('access_token');
  });

  it('throws SocialAuthCodeInvalid error if accessToken not found in response', async () => {
    nock(accessTokenEndpoint)
      .post('')
      .reply(200, { access_token: '', scope: 'scope', token_type: 'token_type' });
    await expect(getAccessToken(mockedConfig, { code: 'code' })).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)
    );
  });
});

describe('getUserInfo', () => {
  beforeEach(() => {
    nock(accessTokenEndpoint).post('').query(true).reply(200, {
      access_token: 'access_token',
      scope: 'scope',
      token_type: 'token_type',
    });
  });

  afterEach(() => {
    nock.cleanAll();
    vi.clearAllMocks();
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
      foo: 'bar',
    });
    nock(userEmailsEndpoint).get('').reply(200, []);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, vi.fn());
    expect(socialUserInfo).toStrictEqual({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'octocat@github.com',
      rawData: {
        userInfo: {
          id: 1,
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          name: 'monalisa octocat',
          email: 'octocat@github.com',
          foo: 'bar',
        },
        userEmails: [],
      },
    });
  });

  it('should fallback to verified primary email if not public is available', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: undefined,
      foo: 'bar',
    });
    nock(userEmailsEndpoint)
      .get('')
      .reply(200, [
        {
          email: 'foo@logto.io',
          verified: true,
          primary: true,
          visibility: 'public',
        },
        {
          email: 'foo1@logto.io',
          verified: true,
          primary: false,
          visibility: null,
        },
      ]);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, vi.fn());
    expect(socialUserInfo).toStrictEqual({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: 'foo@logto.io',
      rawData: {
        userInfo: {
          id: 1,
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          name: 'monalisa octocat',
          foo: 'bar',
        },
        userEmails: [
          {
            email: 'foo@logto.io',
            verified: true,
            primary: true,
            visibility: 'public',
          },
          {
            email: 'foo1@logto.io',
            verified: true,
            primary: false,
            visibility: null,
          },
        ],
      },
    });
  });

  it('should fallback to empty array when can not access to GET /users/emails endpoint', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      foo: 'bar',
    });
    nock(userEmailsEndpoint).get('').reply(403, []);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, vi.fn());
    expect(socialUserInfo).toStrictEqual({
      id: '1',
      avatar: 'https://github.com/images/error/octocat_happy.gif',
      name: 'monalisa octocat',
      email: undefined,
      rawData: {
        userInfo: {
          id: 1,
          avatar_url: 'https://github.com/images/error/octocat_happy.gif',
          name: 'monalisa octocat',
          foo: 'bar',
        },
        userEmails: [],
      },
    });
  });

  it('should convert `null` to `undefined` in SocialUserInfo', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 1,
      avatar_url: null,
      name: null,
      email: null,
    });
    nock(userEmailsEndpoint).get('').reply(200, []);
    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, vi.fn());
    expect(socialUserInfo).toMatchObject({
      id: '1',
      rawData: {
        userInfo: { id: 1, avatar_url: null, name: null, email: null },
        userEmails: [],
      },
    });
  });

  it('throws SocialAccessTokenInvalid error if remote response code is 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);
    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toStrictEqual(
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
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          error: 'access_denied',
          error_description: 'The user has denied your application access.',
          error_uri:
            'https://docs.github.com/apps/troubleshooting-authorization-request-errors#access-denied',
        },
        vi.fn()
      )
    ).rejects.toStrictEqual(
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
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo(
        {
          error: 'general_error',
          error_description: 'General error encountered.',
        },
        vi.fn()
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
    await expect(connector.getUserInfo({ code: 'code' }, vi.fn())).rejects.toThrow();
  });
});
