import { LogResult } from '@logto/schemas';

import { grantErrorListener, grantSuccessListener } from '@/utils/oidc-provider-event-listener';
import { createContextWithRouteParameters } from '@/utils/test-utils';

const addLogContext = jest.fn();
const log = jest.fn();

describe('grantSuccessListener', () => {
  const userId = 'userIdValue';
  const sessionId = 'sessionIdValue';
  const applicationId = 'applicationIdValue';
  const entities = {
    Account: { accountId: userId },
    Grant: { jti: sessionId },
    Client: { clientId: applicationId },
  };

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

  it('should not log when it found unexpected grant_type', async () => {
    const parameters = { grant_type: 'client_credentials' };
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: { entities, params: parameters },
      body: {},
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantSuccessListener(ctx);
    expect(addLogContext).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});

describe('grantErrorListener', () => {
  const applicationId = 'applicationIdValue';
  const entities = { Client: { clientId: applicationId } };
  const errorMessage = 'invalid grant';

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
    await grantErrorListener(ctx, new Error(errorMessage));
    expect(addLogContext).toHaveBeenCalledWith({ applicationId });
    expect(log).toHaveBeenCalledWith('CodeExchangeToken', {
      result: LogResult.Error,
      error: `Error: ${errorMessage}`,
      params: parameters,
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
    await grantErrorListener(ctx, new Error(errorMessage));
    expect(addLogContext).toHaveBeenCalledWith({ applicationId });
    expect(log).toHaveBeenCalledWith('RefreshTokenExchangeToken', {
      result: LogResult.Error,
      error: `Error: ${errorMessage}`,
      params: parameters,
    });
  });

  it('should not log when it found unexpected grant_type', async () => {
    const parameters = { grant_type: 'client_credentials' };
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: { entities, params: parameters },
      body: {},
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantErrorListener(ctx, new Error(errorMessage));
    expect(addLogContext).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
