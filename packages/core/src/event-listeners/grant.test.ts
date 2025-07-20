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

const testGrantListener = (options: {
  parameters: { grant_type: string } & Record<string, unknown>;
  body: Record<string, string>;
  expectLogKey: LogKey;
  expectLogTokenTypes: token.TokenType[];
  expectError?: Error;
}) => {
  const { parameters, body, expectLogKey, expectLogTokenTypes, expectError } = options;
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
    testGrantListener({
      parameters: { grant_type: 'authorization_code', code: 'codeValue' },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      expectLogKey: 'ExchangeTokenBy.AuthorizationCode',
      expectLogTokenTypes: [
        token.TokenType.AccessToken,
        token.TokenType.RefreshToken,
        token.TokenType.IdToken,
      ],
    });
  });

  it('should log type ExchangeTokenBy when grant type is refresh_code', () => {
    testGrantListener({
      parameters: { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      expectLogKey: 'ExchangeTokenBy.RefreshToken',
      expectLogTokenTypes: [
        token.TokenType.AccessToken,
        token.TokenType.RefreshToken,
        token.TokenType.IdToken,
      ],
    });
  });

  test('issued field should not contain "idToken" when there is no issued idToken', () => {
    testGrantListener({
      parameters: { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' },
      body: { access_token: 'newAccessTokenValue', refresh_token: 'newRefreshTokenValue' },
      expectLogKey: 'ExchangeTokenBy.RefreshToken',
      expectLogTokenTypes: [token.TokenType.AccessToken, token.TokenType.RefreshToken],
    });
  });

  it('should log type ExchangeTokenBy when grant type is client_credentials', () => {
    testGrantListener({
      parameters: { grant_type: 'client_credentials' },
      body: { access_token: 'newAccessTokenValue' },
      expectLogKey: 'ExchangeTokenBy.ClientCredentials',
      expectLogTokenTypes: [token.TokenType.AccessToken],
    });
  });

  it('should log type ExchangeTokenBy when grant type is unknown', () => {
    testGrantListener({
      parameters: { grant_type: 'foo' },
      body: { access_token: 'newAccessTokenValue' },
      expectLogKey: 'ExchangeTokenBy.Unknown',
      expectLogTokenTypes: [token.TokenType.AccessToken],
    });
  });
});

describe('grantErrorListener', () => {
  const errorMessage = 'error ocurred';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log type ExchangeTokenBy when error occurred', () => {
    testGrantListener({
      parameters: { grant_type: 'authorization_code', code: 'codeValue' },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
      },
      expectLogKey: 'ExchangeTokenBy.AuthorizationCode',
      expectLogTokenTypes: [
        token.TokenType.AccessToken,
        token.TokenType.RefreshToken,
        token.TokenType.IdToken,
      ],
      expectError: new Error(errorMessage),
    });
  });

  it('should log unknown grant when error occurred', () => {
    testGrantListener({
      parameters: { grant_type: 'foo', code: 'codeValue' },
      body: { access_token: 'newAccessTokenValue' },
      expectLogKey: 'ExchangeTokenBy.Unknown',
      expectLogTokenTypes: [token.TokenType.AccessToken],
      expectError: new Error(errorMessage),
    });
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
