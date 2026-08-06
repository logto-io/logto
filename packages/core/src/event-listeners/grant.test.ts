import type { LogKey } from '@logto/schemas';
import { LogResult, token } from '@logto/schemas';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { stringifyError } from '#src/utils/format.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { createGrantListener, createGrantRevocationListener } from './grant.js';

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

const buildCimdContext = (clientId: string) => ({
  ...createContextWithRouteParameters(),
  createLog: log.createLog,
  prependAllLogEntries: log.prependAllLogEntries,
  oidc: {
    entities: { ...entities, Client: { clientId } },
    params: { grant_type: 'refresh_token' },
  },
  body: { access_token: 'newAccessTokenValue' },
});

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
    prependAllLogEntries: log.prependAllLogEntries,
    oidc: { entities, params: parameters },
    body,
  };

  // @ts-expect-error pass complex type check to mock ctx directly
  createGrantListener(mockEnvSet)(ctx, expectError);
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

  it('should log type ExchangeTokenBy when grant type is device_code', () => {
    testGrantListener(
      { grant_type: 'urn:ietf:params:oauth:grant-type:device_code', device_code: 'deviceCode' },
      { access_token: 'newAccessTokenValue', refresh_token: 'newRefreshTokenValue' },
      'ExchangeTokenBy.DeviceCode',
      [token.TokenType.AccessToken, token.TokenType.RefreshToken]
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

// DEV: CIMD (client ID metadata document) support
describe('grantSuccessListener while CIMD is effectively enabled', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  /**
   * The gate reads only `oidc.cimdEnabled` from the tenant env set; the static flags are
   * stubbed onto `EnvSet.values` below.
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the gate reads
  const cimdEnvSet = { oidc: { cimdEnabled: true } } as EnvSet;

  beforeEach(() => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
      isOidcProviderSsrfProtectionEnabled: true,
    });
  });

  afterEach(() => {
    Sinon.restore();
    jest.clearAllMocks();
  });

  it('should log a cimd client identifier under the dedicated key', () => {
    const ctx = buildCimdContext(cimdClientId);

    // @ts-expect-error pass complex type check to mock ctx directly
    createGrantListener(cimdEnvSet)(ctx);
    expect(log.mockAppend).toHaveBeenCalledWith({
      cimdClientId,
      sessionId,
      userId,
      tokenTypes: [token.TokenType.AccessToken],
      params: { grant_type: 'refresh_token' },
    });
  });

  it('should keep a url-shaped identifier under applicationId when CIMD is not effectively enabled', () => {
    const ctx = buildCimdContext(cimdClientId);

    // @ts-expect-error pass complex type check to mock ctx directly
    createGrantListener(mockEnvSet)(ctx);
    expect(log.mockAppend).toHaveBeenCalledWith({
      applicationId: cimdClientId,
      sessionId,
      userId,
      tokenTypes: [token.TokenType.AccessToken],
      params: { grant_type: 'refresh_token' },
    });
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
      prependAllLogEntries: log.prependAllLogEntries,
      oidc: {
        entities: { Client: client, AccessToken: accessToken },
        params: parameters,
      },
      body: { client_id: applicationId, token: tokenValue },
    };

    // @ts-expect-error pass complex type check to mock ctx directly
    createGrantRevocationListener(mockEnvSet)(ctx, grantId);
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
      prependAllLogEntries: log.prependAllLogEntries,
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
    createGrantRevocationListener(mockEnvSet)(ctx, grantId);
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
