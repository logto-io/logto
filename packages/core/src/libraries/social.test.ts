import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { ConnectorType } from '@logto/schemas';
import { Options, RequestError as GotRequestError } from 'got';

import { mockConnector, mockLogtoConnector, mockMetadata } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type { ConnectorLibrary } from '#src/libraries/connector.js';
import { MockQueries } from '#src/test-utils/tenant.js';
import type { LogtoConnector } from '#src/utils/connectors/types.js';

const { jest } = import.meta;

const { createSocialLibrary } = await import('./social.js');

/** What a social connector throws when its token exchange with the IdP times out. */
const timeoutError = new GotRequestError(
  'Timeout awaiting request',
  { code: 'ETIMEDOUT' },
  new Options({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token?client_secret=super-secret',
    form: { code: 'auth-code', client_id: 'client-id', client_secret: 'super-secret' },
  })
);

/** A `got` error that did receive a response: the connectors handle these themselves. */
class HttpErrorLike extends Error {
  code = 'ERR_NON_2XX_3XX_RESPONSE';
  options = { method: 'POST', url: 'https://oauth2.googleapis.com/token' };
  response = { statusCode: 401 };
}

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

const rejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (error: unknown) {
    return error;
  }

  throw new Error('Expected the promise to reject');
};

describe('social library', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserInfo()', () => {
    it('should relay an unreachable provider as a 502 without the request', async () => {
      const { getUserInfo } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(timeoutError),
      });

      const error = await rejection(getUserInfo('id', {}, jest.fn()));

      expect(error).toBeInstanceOf(RequestError);
      expect(error).toMatchObject({
        code: 'connector.social_provider_unreachable',
        status: 502,
        data: { code: 'ETIMEDOUT', method: 'POST', url: 'https://oauth2.googleapis.com/token' },
      });
      expect(JSON.stringify(error)).not.toContain('super-secret');
    });

    it('should rethrow a provider HTTP error untouched', async () => {
      const httpError = new HttpErrorLike('Response code 401 (Unauthorized)');
      const { getUserInfo } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(httpError),
      });

      expect(await rejection(getUserInfo('id', {}, jest.fn()))).toBe(httpError);
    });

    it('should rethrow a connector error untouched', async () => {
      const connectorError = new ConnectorError(ConnectorErrorCodes.SocialAuthCodeInvalid);
      const { getUserInfo } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(connectorError),
      });

      expect(await rejection(getUserInfo('id', {}, jest.fn()))).toBe(connectorError);
    });
  });

  describe('getUserInfoWithOptionalTokenResponse()', () => {
    it('should relay an unreachable provider as a 502 when token storage is enabled', async () => {
      const { getUserInfoWithOptionalTokenResponse } = createLibrary({
        dbEntry: { ...mockConnector, enableTokenStorage: true },
        metadata: { ...mockMetadata, isTokenStorageSupported: true },
        getTokenResponseAndUserInfo: jest.fn().mockRejectedValue(timeoutError),
      });

      const error = await rejection(getUserInfoWithOptionalTokenResponse('id', {}, jest.fn()));

      expect(error).toBeInstanceOf(RequestError);
      expect(error).toMatchObject({ code: 'connector.social_provider_unreachable', status: 502 });
    });

    it('should relay an unreachable provider as a 502 when token storage is disabled', async () => {
      const { getUserInfoWithOptionalTokenResponse } = createLibrary({
        getUserInfo: jest.fn().mockRejectedValue(timeoutError),
      });

      const error = await rejection(getUserInfoWithOptionalTokenResponse('id', {}, jest.fn()));

      expect(error).toMatchObject({ code: 'connector.social_provider_unreachable', status: 502 });
    });
  });

  describe('refreshTokenSetSecret()', () => {
    it('should relay an unreachable provider as a 502', async () => {
      const { refreshTokenSetSecret } = createLibrary({
        dbEntry: { ...mockConnector, enableTokenStorage: true },
        metadata: { ...mockMetadata, isTokenStorageSupported: true },
        getAccessTokenByRefreshToken: jest.fn().mockRejectedValue(timeoutError),
      });

      const error = await rejection(refreshTokenSetSecret('id', 'secret-id', 'refresh-token'));

      expect(error).toMatchObject({ code: 'connector.social_provider_unreachable', status: 502 });
    });
  });
});
