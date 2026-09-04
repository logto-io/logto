import createClient, { type Middleware } from 'openapi-fetch';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClientCredentials } from './client-credentials.js';
import {
  createManagementApi,
  getBaseUrl,
  getManagementApiIndicator,
  allScope,
  type CreateManagementApiOptions,
} from './management.js';

vi.mock('openapi-fetch');
vi.mock('./client-credentials.js');

const mockCreateClient = vi.mocked(createClient);
const MockClientCredentials = vi.mocked(ClientCredentials);

describe('Management API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getBaseUrl', () => {
    it('should return correct base URL for given tenant ID', () => {
      expect(getBaseUrl('test-tenant')).toBe('https://test-tenant.logto.app');
    });
  });

  describe('getManagementApiIndicator', () => {
    it('should return correct management API indicator for given tenant ID', () => {
      expect(getManagementApiIndicator('test-tenant')).toBe('https://test-tenant.logto.app/api');
    });
  });

  describe('createManagementApi', () => {
    const mockApiClient = {
      use: vi.fn<(...middleware: Middleware[]) => void>(),
    };
    const mockClientCredentials = {
      getAccessToken: vi.fn(),
      invalidateAccessToken: vi.fn(),
      markAccessTokenAsValid: vi.fn(),
    };

    beforeEach(() => {
      // @ts-expect-error -- Only the middleware registration is needed by these tests.
      mockCreateClient.mockReturnValue(mockApiClient);
      MockClientCredentials.mockImplementation(function () {
        return mockClientCredentials;
      });
    });

    it('should create management API with default options', () => {
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };

      const result = createManagementApi('test-tenant', options);

      expect(MockClientCredentials).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tokenEndpoint: 'https://test-tenant.logto.app/oidc/token',
        tokenParams: {
          resource: 'https://test-tenant.logto.app/api',
          scope: allScope,
        },
        tokenRequestTimeout: undefined,
      });

      expect(mockCreateClient).toHaveBeenCalledWith({
        baseUrl: 'https://test-tenant.logto.app',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest's asymmetric matcher accepts any function.
        fetch: expect.any(Function),
      });

      expect(result.apiClient).toMatchObject(mockApiClient);
      expect(result.apiClient.use).toBe(mockApiClient.use);
      expect(result.clientCredentials).toBe(mockClientCredentials);
    });

    it.each([
      ['https://custom.example.com', 'https://custom.example.com'],
      ['https://custom.example.com/', 'https://custom.example.com'],
      ['https://custom.example.com///', 'https://custom.example.com'],
      ['https://custom.example.com/logto', 'https://custom.example.com/logto'],
      ['https://custom.example.com/logto/', 'https://custom.example.com/logto'],
      ['https://custom.example.com/logto///', 'https://custom.example.com/logto'],
    ])(
      'should normalize custom base URL %s and preserve the API indicator',
      (baseUrl, normalizedBaseUrl) => {
        const options: CreateManagementApiOptions = {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          baseUrl,
          apiIndicator: 'https://custom.example.com/custom-api/',
          tokenRequestTimeout: 20,
        };

        createManagementApi('test-tenant', options);

        expect(MockClientCredentials).toHaveBeenCalledWith({
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          tokenEndpoint: `${normalizedBaseUrl}/oidc/token`,
          tokenParams: {
            resource: 'https://custom.example.com/custom-api/',
            scope: allScope,
          },
          tokenRequestTimeout: 20,
        });

        expect(mockCreateClient).toHaveBeenCalledWith({
          baseUrl: normalizedBaseUrl,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest's asymmetric matcher accepts any function.
          fetch: expect.any(Function),
        });
      }
    );

    it('should configure API client middleware correctly', async () => {
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };

      mockClientCredentials.getAccessToken.mockResolvedValue({
        value: 'test-token',
        scope: allScope,
      });

      createManagementApi('test-tenant', options);

      expect(mockApiClient.use).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest's asymmetric matcher accepts any function.
        onRequest: expect.any(Function),
      });

      const middleware = mockApiClient.use.mock.calls[0]?.[0];
      expect(middleware?.onRequest).toBeTypeOf('function');
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      const result = await middleware?.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error: Mock request object
        request: mockRequest,
      });

      expect(mockClientCredentials.getAccessToken).toHaveBeenCalled();
      expect(mockRequest.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
      expect(result).toBe(mockRequest);
    });

    it('should skip auth for well-known endpoints', async () => {
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };

      createManagementApi('test-tenant', options);

      const middleware = mockApiClient.use.mock.calls[0]?.[0];
      expect(middleware?.onRequest).toBeTypeOf('function');
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      const result = await middleware?.onRequest?.({
        schemaPath: '/.well-known/openid-configuration',
        // @ts-expect-error: Mock request object
        request: mockRequest,
      });

      expect(mockClientCredentials.getAccessToken).not.toHaveBeenCalled();
      expect(mockRequest.headers.set).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should warn when scope does not match expected value', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- Silence the expected warning in this test.
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };

      mockClientCredentials.getAccessToken
        .mockResolvedValueOnce({ value: 'first-token', scope: 'limited-scope' })
        .mockResolvedValueOnce({ value: 'first-token', scope: 'limited-scope' })
        .mockResolvedValueOnce({ value: 'second-token', scope: 'limited-scope' })
        .mockResolvedValueOnce({ value: 'third-token', scope: 'read-only' });

      createManagementApi('test-tenant', options);

      const middleware = mockApiClient.use.mock.calls[0]?.[0];
      expect(middleware?.onRequest).toBeTypeOf('function');
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      await middleware?.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error: Mock request object
        request: mockRequest,
      });
      await middleware?.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error -- Only the request and schema path are used by this middleware.
        request: mockRequest,
      });
      await middleware?.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error -- Only the request and schema path are used by this middleware.
        request: mockRequest,
      });
      await middleware?.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error -- Only the request and schema path are used by this middleware.
        request: mockRequest,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        `The scope "limited-scope" is not equal to the expected value "${allScope}". This may cause issues with API access. See https://a.logto.io/m2m-mapi to learn more about configuring machine-to-machine access to the Management API.`
      );
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it.each([
      {
        status: 401,
        schemaPath: '/api/users',
        authorization: 'Bearer rejected-token',
        invalidates: true,
        validates: false,
      },
      {
        status: 200,
        schemaPath: '/api/users',
        authorization: 'Bearer valid-token',
        invalidates: false,
        validates: true,
      },
      {
        status: 403,
        schemaPath: '/api/users',
        authorization: 'Bearer valid-token',
        invalidates: false,
        validates: false,
      },
      {
        status: 500,
        schemaPath: '/api/users',
        authorization: 'Bearer valid-token',
        invalidates: false,
        validates: false,
      },
      {
        status: 401,
        schemaPath: '/api/users',
        authorization: '',
        invalidates: false,
        validates: false,
      },
      {
        status: 401,
        schemaPath: '/api/users',
        authorization: 'Basic credentials',
        invalidates: false,
        validates: false,
      },
      {
        status: 401,
        schemaPath: '/.well-known/openid-configuration',
        authorization: 'Bearer unrelated-token',
        invalidates: false,
        validates: false,
      },
    ])(
      'should handle $status for $schemaPath with "$authorization"',
      async ({ status, schemaPath, authorization, invalidates, validates }) => {
        createManagementApi('test-tenant', {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
        });
        const middleware = mockApiClient.use.mock.calls[1]?.[0];
        expect(middleware?.onResponse).toBeTypeOf('function');
        const request = new Request(`https://test-tenant.logto.app${schemaPath}`, {
          headers: authorization ? { Authorization: authorization } : undefined,
        });
        const response = new Response(null, { status });

        // @ts-expect-error -- This middleware only reads the request, response, and schema path.
        const result = await middleware?.onResponse?.({ request, response, schemaPath });

        if (invalidates) {
          expect(mockClientCredentials.invalidateAccessToken).toHaveBeenCalledExactlyOnceWith(
            'rejected-token'
          );
        } else {
          expect(mockClientCredentials.invalidateAccessToken).not.toHaveBeenCalled();
        }
        if (validates) {
          expect(mockClientCredentials.markAccessTokenAsValid).toHaveBeenCalledExactlyOnceWith(
            'valid-token'
          );
        } else {
          expect(mockClientCredentials.markAccessTokenAsValid).not.toHaveBeenCalled();
        }
        expect(mockClientCredentials.getAccessToken).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
        expect(response.status).toBe(status);
      }
    );
  });
});
