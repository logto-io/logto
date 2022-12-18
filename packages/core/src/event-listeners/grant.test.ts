import type { LogKey } from '@logto/schemas';
import { LogResult, token } from '@logto/schemas';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { stringifyError } from '#src/utils/format.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { grantListener, grantRevocationListener } from './grant.js';

const { jest } = import.meta;

const userId = 'userIdValue';
const sessionId = 'sessionIdValue';
const applicationId = 'applicationIdValue';

const log = createMockLogContext();

const entities = {
  Account: { accountId: userId },
  Session: { jti: sessionId },
  Client: { clientId: applicationId },
};

const baseCallArgs = { applicationId, sessionId, userId };

const testGrantListener = (
  parameters: { grant_type: string } & Record<string, unknown>,
  body: Record<string, string>,
  expectLogKey: LogKey,
  expectLogTokenTypes: token.TokenType[],
  expectError?: Error
) => {
  const ctx = {
    ...createContextWithRouteParameters(),
    createLog: log.createLog,
    oidc: { entities, params: parameters },
    body,
  };

  // @ts-expect-error pass complex type check to mock ctx directly
  grantListener(ctx, expectError);
  expect(log.createLog).toHaveBeenCalledWith(expectLogKey);
  expect(log.mockAppend).toHaveBeenCalledWith({
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

  it('should log type ExchangeTokenBy when grant type is authorization_code', () => {
    testGrantListener(
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

  it('should log type ExchangeTokenBy when grant type is refresh_code', () => {
    testGrantListener(
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

  test('issued field should not contain "idToken" when there is no issued idToken', () => {
    testGrantListener(
      { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' },
      { access_token: 'newAccessTokenValue', refresh_token: 'newRefreshTokenValue' },
      'ExchangeTokenBy.RefreshToken',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken]
    );
  });

  it('should log type ExchangeTokenBy when grant type is client_credentials', () => {
    testGrantListener(
      { grant_type: 'client_credentials' },
      { access_token: 'newAccessTokenValue' },
      'ExchangeTokenBy.ClientCredentials',
      [token.TokenType.AccessToken]
    );
  });

  it('should log type ExchangeTokenBy when grant type is unknown', () => {
    testGrantListener(
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

  it('should log type ExchangeTokenBy when error occurred', () => {
    testGrantListener(
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

  it('should log unknown grant when error occurred', () => {
    testGrantListener(
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

  it('should log token types properly', () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      createLog: log.createLog,
      oidc: {
        entities: { Client: client, AccessToken: accessToken },
        params: parameters,
      },
      body: { client_id: applicationId, token: tokenValue },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    grantRevocationListener(ctx, grantId);
    expect(log.createLog).toHaveBeenCalledWith('RevokeToken');
    expect(log.mockAppend).toHaveBeenCalledWith({
      applicationId,
      userId,
      params: parameters,
      grantId,
      tokenTypes: [token.TokenType.AccessToken],
    });
  });

  it('should log token types properly 2', () => {
    const ctx = {
      ...createContextWithRouteParameters(),
      createLog: log.createLog,
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
    grantRevocationListener(ctx, grantId);
    expect(log.createLog).toHaveBeenCalledWith('RevokeToken');
    expect(log.mockAppend).toHaveBeenCalledWith({
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
