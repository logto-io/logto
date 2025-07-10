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
      use: vi.fn(),
    };
    const mockClientCredentials = {
      getAccessToken: vi.fn(),
    };

    beforeEach(() => {
      // @ts-expect-error
      mockCreateClient.mockReturnValue(mockApiClient);
      // @ts-expect-error
      MockClientCredentials.mockImplementation(() => mockClientCredentials);
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
      });

      expect(mockCreateClient).toHaveBeenCalledWith({
        baseUrl: 'https://test-tenant.logto.app',
      });

      expect(result.apiClient).toBe(mockApiClient);
      expect(result.clientCredentials).toBe(mockClientCredentials);
    });

    it('should create management API with custom base URL and API indicator', () => {
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        baseUrl: 'https://custom.example.com',
        apiIndicator: 'https://custom.example.com/custom-api',
      };

      createManagementApi('test-tenant', options);

      expect(MockClientCredentials).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tokenEndpoint: 'https://custom.example.com/oidc/token',
        tokenParams: {
          resource: 'https://custom.example.com/custom-api',
          scope: allScope,
        },
      });

      expect(mockCreateClient).toHaveBeenCalledWith({
        baseUrl: 'https://custom.example.com',
      });
    });

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        onRequest: expect.any(Function),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const middleware: Middleware = mockApiClient.use.mock.calls[0]?.[0];
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      const result = await middleware.onRequest?.({
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const middleware: Middleware = mockApiClient.use.mock.calls[0]?.[0];
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      const result = await middleware.onRequest?.({
        schemaPath: '/.well-known/openid-configuration',
        // @ts-expect-error: Mock request object
        request: mockRequest,
      });

      expect(mockClientCredentials.getAccessToken).not.toHaveBeenCalled();
      expect(mockRequest.headers.set).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should warn when scope does not match expected value', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const options: CreateManagementApiOptions = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      };

      mockClientCredentials.getAccessToken.mockResolvedValue({
        value: 'test-token',
        scope: 'limited-scope',
      });

      createManagementApi('test-tenant', options);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const middleware: Middleware = mockApiClient.use.mock.calls[0]?.[0];
      const mockRequest = {
        headers: {
          set: vi.fn(),
        },
      };

      await middleware.onRequest?.({
        schemaPath: '/api/test',
        // @ts-expect-error: Mock request object
        request: mockRequest,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        `The scope "limited-scope" is not equal to the expected value "${allScope}". This may cause issues with API access. See https://a.logto.io/m2m-mapi to learn more about configuring machine-to-machine access to the Management API.`
      );

      consoleSpy.mockRestore();
    });
  });
});
