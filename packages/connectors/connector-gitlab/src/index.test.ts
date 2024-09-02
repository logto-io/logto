import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes, type SocialUserInfo } from '@logto/connector-kit';

import { authorizationEndpoint, tokenEndpoint, userInfoEndpoint } from './constant.js';
import createConnector from './index.js';

const getConfig = vi.fn().mockResolvedValue({
  clientId: '<client-id>',
  clientSecret: '<client-secret>',
  scope: 'profile email',
});

const getSessionMock = vi.fn().mockResolvedValue({ redirectUri: 'http://localhost:3000/callback' });

describe('GitLab connector', () => {
  beforeEach(() => {
    nock(tokenEndpoint).post('').reply(200, {
      access_token: 'access_token',
      scope: 'scope',
      token_type: 'token_type',
    });
  });

  afterEach(() => {
    nock.cleanAll();
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
      `${authorizationEndpoint}?${new URLSearchParams({
        response_type: 'code',
        client_id: '<client-id>',
        scope: 'profile email openid', // We add openid to the scopes if not present always
        redirect_uri: 'http://localhost:3000/callback',
        state: 'some_state',
      }).toString()}`
    );
  });

  it('should get valid SocialUserInfo', async () => {
    nock(userInfoEndpoint)
      .get('')
      .reply(200, {
        sub: '1234567',
        sub_legacy: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        name: 'John Doe',
        nickname: 'john.doe',
        preferred_username: 'john.doe',
        email: 'john.doe@example.com',
        email_verified: true,
        profile: 'https://gitlab.com/john.doe',
        picture: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
        groups: ['group1', 'group2', 'group3'],
      });

    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, getSessionMock);
    const expectedSocialUserInfo: SocialUserInfo = {
      id: '1234567',
      avatar: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
      name: 'John Doe',
      email: 'john.doe@example.com',
      rawData: {
        sub: '1234567',
        sub_legacy: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        name: 'John Doe',
        nickname: 'john.doe',
        preferred_username: 'john.doe',
        email: 'john.doe@example.com',
        email_verified: true,
        profile: 'https://gitlab.com/john.doe',
        picture: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
        groups: ['group1', 'group2', 'group3'],
      },
    };

    expect(socialUserInfo).toStrictEqual(expectedSocialUserInfo);
  });

  it('should not return email when email_verified is false on SocialUserInfo', async () => {
    nock(userInfoEndpoint)
      .get('')
      .reply(200, {
        sub: '1234567',
        sub_legacy: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        name: 'John Doe',
        nickname: 'john.doe',
        preferred_username: 'john.doe',
        email: 'john.doe@example.com',
        email_verified: false,
        profile: 'https://gitlab.com/john.doe',
        picture: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
        groups: ['group1', 'group2', 'group3'],
      });

    const connector = await createConnector({ getConfig });
    const socialUserInfo = await connector.getUserInfo({ code: 'code' }, getSessionMock);
    const expectedSocialUserInfo: SocialUserInfo = {
      id: '1234567',
      avatar: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
      name: 'John Doe',
      rawData: {
        sub: '1234567',
        sub_legacy: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        name: 'John Doe',
        nickname: 'john.doe',
        preferred_username: 'john.doe',
        email: 'john.doe@example.com',
        email_verified: false,
        profile: 'https://gitlab.com/john.doe',
        picture: 'https://gitlab.com/uploads/-/system/user/avatar/1234567/avatar.png',
        groups: ['group1', 'group2', 'group3'],
      },
    };

    expect(socialUserInfo).toStrictEqual(expectedSocialUserInfo);
  });

  it('throws AuthorizationFailed error if authentication failed', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.getUserInfo({ error: 'some error' }, getSessionMock)
    ).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, { error: 'some error' })
    );
  });

  it('throws InvalidResponse error if token response is invalid', async () => {
    // Clear token response mock
    nock.cleanAll();

    nock(tokenEndpoint).post('').reply(200, {
      invalid_field: true,
    });

    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, getSessionMock)).rejects.toSatisfy(
      (connectorError) =>
        (connectorError as ConnectorError).code === ConnectorErrorCodes.InvalidResponse
    );
  });

  it('throws InvalidResponse error if userinfo response is invalid', async () => {
    nock(userInfoEndpoint).get('').reply(200, {
      id: 'id',
    });

    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, getSessionMock)).rejects.toSatisfy(
      (connectorError) =>
        (connectorError as ConnectorError).code === ConnectorErrorCodes.InvalidResponse
    );
  });

  it('throws SocialAccessTokenInvalid error if user info responded with 401', async () => {
    nock(userInfoEndpoint).get('').reply(401);

    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, getSessionMock)).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.SocialAccessTokenInvalid)
    );
  });

  it('throws General error if user info responded with a non-401 error', async () => {
    nock(userInfoEndpoint).get('').reply(422);

    const connector = await createConnector({ getConfig });
    await expect(connector.getUserInfo({ code: 'code' }, getSessionMock)).rejects.toStrictEqual(
      new ConnectorError(ConnectorErrorCodes.General)
    );
  });
});
