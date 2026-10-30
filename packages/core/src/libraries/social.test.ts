import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { ConsoleLog } from '@logto/shared';
import { Options, RequestError as GotRequestError } from 'got';

import { mockConnector, mockLogtoConnector, mockMetadata } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

const { jest } = import.meta;

const { createSocialLibrary } = await import('./social.js');

const tokenUrl = 'https://oauth2.googleapis.com/token';

/** What a `got` based social connector throws when its token exchange with the IdP times out. */
const gotTimeoutError = new GotRequestError(
  'Timeout awaiting request',
  { code: 'ETIMEDOUT' },
  new Options({
    method: 'POST',
    url: `${tokenUrl}?client_secret=super-secret`,
    form: { code: 'auth-code', client_id: 'client-id', client_secret: 'super-secret' },
  })
);

/** A `got` error that received a response but could not read it to the end. */
class GotReadErrorLike extends Error {
  code = 'ECONNRESET';
  options = { method: 'POST', url: tokenUrl };
  // `got` sets `response` on every request-bound error once the headers arrived
  response = { statusCode: 200 };
}

/** What `got` throws on a non-2xx response: the connectors handle these themselves. */
class GotHttpErrorLike extends Error {
  code = 'ERR_NON_2XX_3XX_RESPONSE';
  options = { method: 'POST', url: tokenUrl };
  response = { statusCode: 401 };
}

/** What `got` throws on an unparsable body. */
class GotParseErrorLike extends Error {
  code = 'ERR_BODY_PARSE_FAILURE';
  options = { method: 'POST', url: tokenUrl };
  response = { statusCode: 200 };
}

/** What a `ky` based social connector throws when its request to the IdP times out. */
class KyTimeoutErrorLike extends Error {
  name = 'TimeoutError';
  request = { url: `${tokenUrl}?client_secret=super-secret`, method: 'POST' };

  constructor() {
    super('Request timed out');
  }
}

/** What `fetch` (hence `ky`) throws when the IdP host cannot be reached. */
class DnsFailure extends Error {
  code = 'ENOTFOUND';
}
const fetchFailure = new TypeError('fetch failed', {
  cause: new DnsFailure('getaddrinfo ENOTFOUND oauth2.googleapis.com'),
});

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

const createContext = () => {
  const consoleLog = new ConsoleLog();
  const warn = jest.spyOn(consoleLog, 'warn').mockImplementation(() => {
    // Keep the test output clean
  });

  return { ctx: { console: consoleLog } as unknown as WithLogContext, warn };
};

const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error: unknown) {
    return error;
  }

  throw new Error('Expected the promise to reject');
};

const unreachable = {
  code: 'connector.social_provider_unreachable',
  status: 502,
  data: { code: 'ETIMEDOUT', connectorId: 'id' },
};

describe('social library', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo()', () => {
    it('should relay an unreachable provider as a 502 carrying the network code only', async () => {
      const { getUserInfo } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(gotTimeoutError),
      });

      const error = await rejection(getUserInfo('id', {}, jest.fn()));

      expect(error).toBeInstanceOf(RequestError);
      expect(error).toMatchObject(unreachable);
      expect(JSON.stringify(error)).not.toContain('super-secret');
      expect(JSON.stringify(error)).not.toContain('googleapis.com');
    });

    it.each([
      ['a `ky` timeout', new KyTimeoutErrorLike(), 'ETIMEDOUT'],
      ['a `fetch` failure', fetchFailure, 'ENOTFOUND'],
      [
        'a `got` read error with a partial response',
        new GotReadErrorLike('read ECONNRESET'),
        'ECONNRESET',
      ],
    ])('should relay %s as a 502', async (_, thrown, code) => {
      const { getUserInfo } = createLibrary({ getUserInfo: jest.fn().mockRejectedValue(thrown) });

      const error = await rejection(getUserInfo('id', {}, jest.fn()));

      expect(error).toMatchObject({ ...unreachable, data: { code, connectorId: 'id' } });
      expect(JSON.stringify(error)).not.toContain('super-secret');
    });

    it.each([
      ['a provider HTTP error', new GotHttpErrorLike('Response code 401 (Unauthorized)')],
      ['an unparsable provider response', new GotParseErrorLike('Unexpected token')],
      ['a connector error', new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid)],
      ['any other error', new Error('boom')],
    ])('should rethrow %s untouched', async (_, thrown) => {
      const { getUserInfo } = createLibrary({ getUserInfo: jest.fn().mockRejectedValue(thrown) });

      expect(await rejection(getUserInfo('id', {}, jest.fn()))).toBe(thrown);
    });
  });

  describe('getUserInfoWithOptionalTokenResponse()', () => {
    it('should relay an unreachable provider as a 502 and log the request server-side when token storage is enabled', async () => {
      const { ctx, warn } = createContext();
      const { getUserInfoWithOptionalTokenResponse } = createLibrary({
        dbEntry: { ...mockConnector, enableTokenStorage: true },
        metadata: { ...mockMetadata, isTokenStorageSupported: true },
        getTokenResponseAndUserInfo: jest.fn().mockRejectedValue(gotTimeoutError),
      });

      const error = await rejection(getUserInfoWithOptionalTokenResponse('id', {}, jest.fn(), ctx));

      expect(error).toMatchObject(unreachable);
      expect(warn).toHaveBeenCalledTimes(1);
      const logged = String(warn.mock.calls[0]?.[0]);
      expect(logged).toContain('ETIMEDOUT');
      expect(logged).toContain(`POST ${tokenUrl}`);
      expect(logged).not.toContain('super-secret');
    });

    it('should relay an unreachable provider as a 502 when token storage is disabled', async () => {
      const { ctx } = createContext();
      const { getUserInfoWithOptionalTokenResponse } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(new KyTimeoutErrorLike()),
      });

      const error = await rejection(getUserInfoWithOptionalTokenResponse('id', {}, jest.fn(), ctx));

      expect(error).toMatchObject(unreachable);
    });
  });

  describe('refreshTokenSetSecret()', () => {
    it('should relay an unreachable provider as a 502', async () => {
      const { refreshTokenSetSecret } = createLibrary({
        dbEntry: { ...mockConnector, enableTokenStorage: true },
        metadata: { ...mockMetadata, isTokenStorageSupported: true },
        getAccessTokenByRefreshToken: jest.fn().mockRejectedValue(fetchFailure),
      });

      const error = await rejection(refreshTokenSetSecret('id', 'secret-id', 'refresh-token'));

      expect(error).toMatchObject({
        ...unreachable,
        data: { code: 'ENOTFOUND', connectorId: 'id' },
      });
    });
  });
});
