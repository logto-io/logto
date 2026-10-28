import { ConnectorErrorCodes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';

import { mockConnector, mockLogtoConnector, mockMetadata } from '#src/__mocks__/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

const { jest } = import.meta;

const { createSocialLibrary } = await import('./social.js');

const createLibrary = (connector: Partial<LogtoConnector>) =>
  createSocialLibrary(new MockQueries({}), {
    getLogtoConnectorById: jest.fn().mockResolvedValue({
      dbEntry: mockConnector,
      metadata: mockMetadata,
      type: ConnectorType.Social,
      ...mockLogtoConnector,
      ...connector,
    }),
  } as unknown as ConnectorLibrary);

const getSession = jest.fn();

/** What Microsoft Entra ID sends back to the redirect URI when the user declines the consent. */
const declinedCallback = {
  error: 'access_denied',
  error_description: 'AADSTS65004: User declined to consent to access the app.',
  error_subcode: 'cancel',
  state: 'state',
  redirectUri: 'https://logto.example.com/callback/connector-id',
};

const authorizationFailed = {
  code: ConnectorErrorCodes.AuthorizationFailed,
  data: {
    error: 'access_denied',
    error_description: 'AADSTS65004: User declined to consent to access the app.',
  },
};

describe('social library on a declined authorization', () => {
  it('getUserInfo() should reject with `AuthorizationFailed` before calling the connector', async () => {
    const getUserInfo = jest.fn();
    const { getUserInfo: getUserInfoFromLibrary } = createLibrary({ getUserInfo });

    await expect(
      getUserInfoFromLibrary('connector-id', declinedCallback, getSession)
    ).rejects.toMatchObject(authorizationFailed);
    expect(getUserInfo).not.toHaveBeenCalled();
  });

  it('getUserInfoWithOptionalTokenResponse() should reject with `AuthorizationFailed` before calling the connector', async () => {
    const getUserInfo = jest.fn();
    const getTokenResponseAndUserInfo = jest.fn();
    const { getUserInfoWithOptionalTokenResponse } = createLibrary({
      getUserInfo,
      getTokenResponseAndUserInfo,
      metadata: { ...mockMetadata, isTokenStorageSupported: true },
      dbEntry: { ...mockConnector, enableTokenStorage: true },
    });

    await expect(
      getUserInfoWithOptionalTokenResponse('connector-id', declinedCallback, getSession)
    ).rejects.toMatchObject(authorizationFailed);
    expect(getTokenResponseAndUserInfo).not.toHaveBeenCalled();
    expect(getUserInfo).not.toHaveBeenCalled();
  });

  it('should pass an authorization result to the connector', async () => {
    const getUserInfo = jest.fn().mockResolvedValue({ id: 'user-id' });
    const { getUserInfo: getUserInfoFromLibrary } = createLibrary({ getUserInfo });

    await expect(
      getUserInfoFromLibrary('connector-id', { code: 'auth-code', state: 'state' }, getSession)
    ).resolves.toEqual({ id: 'user-id' });
    expect(getUserInfo).toHaveBeenCalledWith({ code: 'auth-code', state: 'state' }, getSession);
  });
});
