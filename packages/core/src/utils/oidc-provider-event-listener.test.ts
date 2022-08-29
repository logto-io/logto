import { LogResult, TokenType } from '@logto/schemas';
import { Provider } from 'oidc-provider';

import {
  addOidcEventListeners,
  grantErrorListener,
  grantRevokedListener,
  grantSuccessListener,
} from '@/utils/oidc-provider-event-listener';
import { createContextWithRouteParameters } from '@/utils/test-utils';

const userId = 'userIdValue';
const sessionId = 'sessionIdValue';
const applicationId = 'applicationIdValue';

const addLogContext = jest.fn();
const log = jest.fn();
const addListener = jest.fn();

jest.mock('oidc-provider', () => ({ Provider: jest.fn(() => ({ addListener })) }));

describe('addOidcEventListeners', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add grantSuccessListener', () => {
    const provider = new Provider('');
    addOidcEventListeners(provider);
    expect(addListener).toHaveBeenCalledWith('grant.success', grantSuccessListener);
  });

  it('should add grantErrorListener', () => {
    const provider = new Provider('');
    addOidcEventListeners(provider);
    expect(addListener).toHaveBeenCalledWith('grant.error', grantErrorListener);
  });

  it('should add grantRevokedListener', () => {
    const provider = new Provider('');
    addOidcEventListeners(provider);
    expect(addListener).toHaveBeenCalledWith('grant.revoked', grantRevokedListener);
  });
});

describe('grantSuccessListener', () => {
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
      issued: Object.values(TokenType),
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
      issued: Object.values(TokenType),
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
      issued: [TokenType.AccessToken, TokenType.RefreshToken],
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

describe('grantRevokedListener', () => {
  const grantId = 'grantIdValue';
  const token = 'tokenValue';
  const parameters = { token };

  const client = { clientId: applicationId };
  const accessToken = { accountId: userId };
  const refreshToken = { accountId: userId };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log token type AccessToken when the token is an access token', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: {
        entities: { Client: client, AccessToken: accessToken },
        params: parameters,
      },
      body: { client_id: applicationId, token },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantRevokedListener(ctx, grantId);
    expect(addLogContext).toHaveBeenCalledWith({ applicationId });
    expect(log).toHaveBeenCalledWith('RevokeToken', {
      userId,
      params: parameters,
      grantId,
      tokenType: TokenType.AccessToken,
    });
  });

  it('should log token type RefreshToken when the token is a refresh code', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: {
        entities: { Client: client, RefreshToken: refreshToken },
        params: parameters,
      },
      body: { client_id: applicationId, token },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantRevokedListener(ctx, grantId);
    expect(addLogContext).toHaveBeenCalledWith({ applicationId });
    expect(log).toHaveBeenCalledWith('RevokeToken', {
      userId,
      params: parameters,
      grantId,
      tokenType: TokenType.RefreshToken,
    });
  });

  it('should not log when the revoked token is neither access token nor refresh token', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      addLogContext,
      log,
      oidc: {
        entities: { Client: client },
        params: parameters,
      },
      body: { client_id: applicationId, token },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantRevokedListener(ctx, grantId);
    expect(addLogContext).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
