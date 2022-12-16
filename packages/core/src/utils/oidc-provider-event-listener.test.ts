import type { LogKey } from '@logto/schemas';
import { LogResult, token } from '@logto/schemas';

import { createMockLogContext } from '#src/test-utils/koa-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import {
  addOidcEventListeners,
  grantListener,
  grantRevocationListener,
} from '#src/utils/oidc-provider-event-listener.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { stringifyError } from './format.js';

const { jest } = import.meta;

const userId = 'userIdValue';
const sessionId = 'sessionIdValue';
const applicationId = 'applicationIdValue';

const log = createMockLogContext();

describe('addOidcEventListeners', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add proper listeners', () => {
    const provider = createMockProvider();
    const addListener = jest.spyOn(provider, 'addListener');
    addOidcEventListeners(provider);
    expect(addListener).toHaveBeenCalledWith('grant.success', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.error', grantListener);
    expect(addListener).toHaveBeenCalledWith('grant.revoked', grantRevocationListener);
  });
});

const entities = {
  Account: { accountId: userId },
  Grant: { jti: sessionId },
  Client: { clientId: applicationId },
};

const baseCallArgs = { applicationId, sessionId, userId };

const testGrantListener = async (
  parameters: { grant_type: string } & Record<string, unknown>,
  body: Record<string, string>,
  expectLogKey: LogKey,
  expectLogTokenTypes: token.TokenType[],
  expectError?: Error
) => {
  const ctx = {
    ...createContextWithRouteParameters(),
    log,
    oidc: { entities, params: parameters },
    body,
  };

  // @ts-expect-error pass complex type check to mock ctx directly
  await grantListener(ctx, expectError);
  expect(log.setKey).toHaveBeenCalledWith(expectLogKey);
  expect(log).toHaveBeenCalledWith({
    ...baseCallArgs,
    result: expectError && LogResult.Error,
    tokenTypes: expectLogTokenTypes,
    error: expectError && stringifyError(expectError),
    params: parameters,
  });
};

describe('grantSuccessListener', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log type ExchangeTokenBy when grant type is authorization_code', async () => {
    await testGrantListener(
      { grant_type: 'authorization_code', code: 'codeValue' },
      {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      'ExchangeTokenBy.AuthorizationCode',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken, token.TokenType.IdToken]
    );
  });

  it('should log type ExchangeTokenBy when grant type is refresh_code', async () => {
    await testGrantListener(
      { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' },
      {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      'ExchangeTokenBy.RefreshToken',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken, token.TokenType.IdToken]
    );
  });

  test('issued field should not contain "idToken" when there is no issued idToken', async () => {
    await testGrantListener(
      { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' },
      { access_token: 'newAccessTokenValue', refresh_token: 'newRefreshTokenValue' },
      'ExchangeTokenBy.RefreshToken',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken]
    );
  });

  it('should log type ExchangeTokenBy when grant type is client_credentials', async () => {
    await testGrantListener(
      { grant_type: 'client_credentials' },
      { access_token: 'newAccessTokenValue' },
      'ExchangeTokenBy.ClientCredentials',
      [token.TokenType.AccessToken]
    );
  });

  it('should log type ExchangeTokenBy when grant type is unknown', async () => {
    await testGrantListener(
      { grant_type: 'foo' },
      { access_token: 'newAccessTokenValue' },
      'ExchangeTokenBy.Unknown',
      [token.TokenType.AccessToken]
    );
  });
});

describe('grantErrorListener', () => {
  const errorMessage = 'error ocurred';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log type ExchangeTokenBy when error occurred', async () => {
    await testGrantListener(
      { grant_type: 'authorization_code', code: 'codeValue' },
      {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      'ExchangeTokenBy.AuthorizationCode',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken, token.TokenType.IdToken],
      new Error(errorMessage)
    );
  });

  it('should log unknown grant when error occurred', async () => {
    await testGrantListener(
      { grant_type: 'foo', code: 'codeValue' },
      { access_token: 'newAccessTokenValue' },
      'ExchangeTokenBy.Unknown',
      [token.TokenType.AccessToken],
      new Error(errorMessage)
    );
  });
});

describe('grantRevocationListener', () => {
  const grantId = 'grantIdValue';
  const tokenValue = 'tokenValue';
  const parameters = { token: tokenValue };

  const client = { clientId: applicationId };
  const accessToken = { accountId: userId };
  const refreshToken = { accountId: userId };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log token types properly', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      log,
      oidc: {
        entities: { Client: client, AccessToken: accessToken },
        params: parameters,
      },
      body: { client_id: applicationId, token: tokenValue },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantRevocationListener(ctx, grantId);
    expect(log.setKey).toHaveBeenCalledWith('RevokeToken');
    expect(log).toHaveBeenCalledWith({
      applicationId,
      userId,
      params: parameters,
      grantId,
      tokenTypes: [token.TokenType.AccessToken],
    });
  });

  it('should log token types properly 2', async () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      log,
      oidc: {
        entities: {
          Client: client,
          AccessToken: accessToken,
          RefreshToken: refreshToken,
          DeviceCode: 'mock',
        },
        params: parameters,
      },
      body: { client_id: applicationId, token: tokenValue },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    await grantRevocationListener(ctx, grantId);
    expect(log.setKey).toHaveBeenCalledWith('RevokeToken');
    expect(log).toHaveBeenCalledWith({
      applicationId,
      userId,
      params: parameters,
      grantId,
      tokenTypes: [
        token.TokenType.AccessToken,
        token.TokenType.RefreshToken,
        token.TokenType.DeviceCode,
      ],
    });
  });
});
