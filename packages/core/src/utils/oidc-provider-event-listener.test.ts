import { grantSuccessListener } from '@/utils/oidc-provider-event-listener';
import { createContextWithRouteParameters } from '@/utils/test-utils';

describe('grantSuccessListener', () => {
  const userId = 'userIdValue';
  const sessionId = 'sessionIdValue';
  const applicationId = 'applicationIdValue';
  const entities = {
    Account: { accountId: userId },
    Grant: { jti: sessionId },
    Client: { clientId: applicationId },
  };

  const addLogContext = jest.fn();
  const log = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log type CodeExchangeToken when grant type is authorization_code', async () => {
    const parameters = { grant_type: 'authorization_code', code: 'codeValue' };
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: { entities, params: parameters },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
        scope: 'openid offline-access',
      },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantSuccessListener(ctx);
    expect(addLogContext).toHaveBeenCalledWith({ applicationId, sessionId });
    expect(log).toHaveBeenCalledWith('CodeExchangeToken', {
      issued: ['accessToken', 'refreshToken', 'idToken'],
      params: parameters,
      scope: 'openid offline-access',
      userId,
    });
  });

  it('should log type RefreshTokenExchangeToken when grant type is refresh_code', async () => {
    const parameters = { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' };
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: { entities, params: parameters },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
        scope: 'openid offline-access',
      },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantSuccessListener(ctx);
    expect(addLogContext).toHaveBeenCalledWith({ applicationId, sessionId });
    expect(log).toHaveBeenCalledWith('RefreshTokenExchangeToken', {
      issued: ['accessToken', 'refreshToken', 'idToken'],
      params: parameters,
      scope: 'openid offline-access',
      userId,
    });
  });

  test('issued field should not contain "idToken" when there is no issued idToken', async () => {
    const parameters = { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' };
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: { entities, params: parameters },
      body: {
        // There is no idToken here.
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        scope: 'offline-access',
      },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantSuccessListener(ctx);
    expect(addLogContext).toHaveBeenCalledWith({ applicationId, sessionId });
    expect(log).toHaveBeenCalledWith('RefreshTokenExchangeToken', {
      issued: ['accessToken', 'refreshToken'],
      params: parameters,
      scope: 'offline-access',
      userId,
    });
  });
});
