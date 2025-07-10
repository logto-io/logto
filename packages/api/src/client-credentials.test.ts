import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  ClientCredentials,
  ClientCredentialsError,
  type ClientCredentialsOptions,
} from './client-credentials.js';

// Mock fetch globally
const mockFetch = vi.fn();
// eslint-disable-next-line @silverhand/fp/no-mutation
global.fetch = mockFetch;

describe('ClientCredentialsError', () => {
  it('should create error with correct name', () => {
    const error = new ClientCredentialsError('test message');
    expect(error.name).toBe('ClientCredentialsError');
    expect(error.message).toBe('test message');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ClientCredentials', () => {
  const defaultOptions: ClientCredentialsOptions = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenEndpoint: 'https://example.com/token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create instance with options', () => {
      const credentials = new ClientCredentials(defaultOptions);
      expect(credentials).toBeInstanceOf(ClientCredentials);
    });
  });

  describe('AccessTokenExpiryLeeway', () => {
    it('should return default value of 60 when not specified', () => {
      const credentials = new ClientCredentials(defaultOptions);
      expect(credentials.accessTokenExpiryLeeway).toBe(60);
    });

    it('should return custom value when specified', () => {
      const options = { ...defaultOptions, accessTokenExpiryLeeway: 120 };
      const credentials = new ClientCredentials(options);
      expect(credentials.accessTokenExpiryLeeway).toBe(120);
    });
  });

  describe('getAccessToken', () => {
    it('should fetch and return access token on first call', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);
      const token = await credentials.getAccessToken();

      expect(token.value).toBe('test-token');
      expect(token.scope).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&client_id=test-client-id&client_secret=test-client-secret',
      });
    });

    it('should include scope in token when provided in response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600,
          scope: 'read write admin',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);
      const token = await credentials.getAccessToken();

      expect(token.value).toBe('test-token');
      expect(token.scope).toBe('read write admin');
    });

    it('should include token params in request body', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600,
          scope: 'read write',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const options = {
        ...defaultOptions,
        tokenParams: { scope: 'read write', audience: 'api' },
      };
      const credentials = new ClientCredentials(options);
      const token = await credentials.getAccessToken();

      expect(token.scope).toBe('read write');
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&client_id=test-client-id&client_secret=test-client-secret&scope=read+write&audience=api',
      });
    });

    it('should return cached token if not expired', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 3600,
          scope: 'cached-scope',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      // First call
      await credentials.getAccessToken();

      // Second call - should use cached token
      const token = await credentials.getAccessToken();

      expect(token.value).toBe('test-token');
      expect(token.scope).toBe('cached-scope');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should refresh token when expired', async () => {
      const mockResponse1 = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token-1',
          expires_in: 100,
          scope: 'scope-1',
        }),
      };
      const mockResponse2 = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token-2',
          expires_in: 3600,
          scope: 'scope-2',
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      const credentials = new ClientCredentials(defaultOptions);

      // First call
      await credentials.getAccessToken();

      // Advance time past expiry
      vi.advanceTimersByTime(100 * 1000);

      // Second call - should refresh token
      const token = await credentials.getAccessToken();

      expect(token.value).toBe('test-token-2');
      expect(token.scope).toBe('scope-2');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should refresh token when close to expiry (within leeway)', async () => {
      const mockResponse1 = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token-1',
          expires_in: 120,
          scope: 'scope-1',
        }),
      };
      const mockResponse2 = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token-2',
          expires_in: 3600,
          scope: 'scope-2',
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      const credentials = new ClientCredentials(defaultOptions);

      // First call
      await credentials.getAccessToken();

      // Advance time to within leeway period (120 - 60 = 60 seconds + 1)
      vi.advanceTimersByTime(61 * 1000);

      // Second call - should refresh token
      const token = await credentials.getAccessToken();

      expect(token.value).toBe('test-token-2');
      expect(token.scope).toBe('scope-2');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when fetch fails', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      await expect(credentials.getAccessToken()).rejects.toThrow(ClientCredentialsError);
      await expect(credentials.getAccessToken()).rejects.toThrow(
        'Failed to fetch access token: 401 Unauthorized'
      );
    });

    it('should throw error when response is not an object', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue('invalid response'),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      await expect(credentials.getAccessToken()).rejects.toThrow(ClientCredentialsError);
      await expect(credentials.getAccessToken()).rejects.toThrow(
        'Invalid response from token endpoint'
      );
    });

    it('should throw error when access_token is missing', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          expires_in: 3600,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      await expect(credentials.getAccessToken()).rejects.toThrow(ClientCredentialsError);
      await expect(credentials.getAccessToken()).rejects.toThrow(
        'Invalid response from token endpoint'
      );
    });

    it('should throw error when expires_in is missing', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      await expect(credentials.getAccessToken()).rejects.toThrow(ClientCredentialsError);
      await expect(credentials.getAccessToken()).rejects.toThrow(
        'Invalid or missing expires_in in token response'
      );
    });

    it('should throw error when expires_in is not a number', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          access_token: 'test-token',
          expires_in: 'invalid',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const credentials = new ClientCredentials(defaultOptions);

      await expect(credentials.getAccessToken()).rejects.toThrow(ClientCredentialsError);
      await expect(credentials.getAccessToken()).rejects.toThrow(
        'Invalid or missing expires_in in token response'
      );
    });
  });
});
