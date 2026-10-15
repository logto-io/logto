import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ClientCredentials, type ClientCredentialsOptions } from './client-credentials.js';
import { getAbortReason } from './timeout.js';

const mockFetch = vi.fn();

describe('ClientCredentials token lifecycle', () => {
  const defaultOptions: ClientCredentialsOptions = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenEndpoint: 'https://example.com/token',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', mockFetch);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getAccessToken', () => {
    it('should share a token fetch across concurrent calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });
      const credentials = new ClientCredentials(defaultOptions);

      const tokens = await Promise.all([
        credentials.getAccessToken(),
        credentials.getAccessToken(),
        credentials.getAccessToken(),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(tokens.map(({ value }) => value)).toEqual(['test-token', 'test-token', 'test-token']);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should not create a timeout timer when the timeout is disabled', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token', expires_in: 3600 }),
      });
      const credentials = new ClientCredentials({ ...defaultOptions, tokenRequestTimeout: 0 });

      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'test-token');
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should keep token fetches separate for different credentials instances', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'first-token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'second-token', expires_in: 3600 }),
        });

      const tokens = await Promise.all([
        new ClientCredentials(defaultOptions).getAccessToken(),
        new ClientCredentials({ ...defaultOptions, clientId: 'another-client' }).getAccessToken(),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(tokens.map(({ value }) => value)).toEqual(['first-token', 'second-token']);
    });

    it('should use one custom signal per shared token fetch and recover after cancellation', async () => {
      const firstTokenController = new AbortController();
      const secondTokenController = new AbortController();
      const getTokenRequestSignal = vi
        .fn<() => AbortSignal>()
        .mockReturnValueOnce(firstTokenController.signal)
        .mockReturnValueOnce(secondTokenController.signal);
      const abortError = new DOMException('Application shutdown', 'AbortError');
      mockFetch.mockImplementationOnce(async (_url: string, { signal }: RequestInit) => {
        if (!signal) {
          throw new Error('Missing abort signal');
        }

        return new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => {
            reject(getAbortReason(signal, 'Token request aborted'));
          });
        });
      });
      const credentials = new ClientCredentials({
        ...defaultOptions,
        getTokenRequestSignal,
      });
      const cancelled = Promise.allSettled([
        credentials.getAccessToken(),
        credentials.getAccessToken(),
      ]);

      firstTokenController.abort(abortError);

      expect(await cancelled).toMatchObject([
        { status: 'rejected', reason: { cause: abortError } },
        { status: 'rejected', reason: { cause: abortError } },
      ]);
      expect(getTokenRequestSignal).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });

      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(getTokenRequestSignal).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should wrap token request signal factory errors', async () => {
      const cause = new Error('Signal unavailable');
      const credentials = new ClientCredentials({
        ...defaultOptions,
        getTokenRequestSignal: () => {
          throw cause;
        },
      });

      await expect(credentials.getAccessToken()).rejects.toMatchObject({
        name: 'ClientCredentialsError',
        cause,
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should share a failure and allow a later fetch to succeed', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Token request failed'));
      const credentials = new ClientCredentials(defaultOptions);
      const results = await Promise.allSettled([
        credentials.getAccessToken(),
        credentials.getAccessToken(),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(results.map(({ status }) => status)).toEqual(['rejected', 'rejected']);
      expect(vi.getTimerCount()).toBe(0);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should time out a pending fetch and allow a later fetch', async () => {
      const onAbort = vi.fn();
      mockFetch.mockImplementationOnce(async (_url: string, { signal }: RequestInit) => {
        if (!signal) {
          throw new Error('Missing abort signal');
        }
        const waitForAbort = async () =>
          new Promise<never>((_resolve, reject) => {
            signal.addEventListener('abort', () => {
              onAbort();
              reject(signal.reason instanceof Error ? signal.reason : new Error('Aborted'));
            });
          });
        return waitForAbort();
      });
      const credentials = new ClientCredentials(defaultOptions);
      const results = Promise.allSettled([
        credentials.getAccessToken(),
        credentials.getAccessToken(),
      ]);

      await vi.advanceTimersByTimeAsync(9999);
      expect(onAbort).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);

      expect(await results).toMatchObject([
        {
          status: 'rejected',
          reason: { name: 'ClientCredentialsError', cause: { name: 'TimeoutError' } },
        },
        {
          status: 'rejected',
          reason: { name: 'ClientCredentialsError', cause: { name: 'TimeoutError' } },
        },
      ]);
      expect(onAbort).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('should time out an unresponsive body reader and ignore its late result', async () => {
      const resolveBody = vi.fn<(value: unknown) => void>();
      const body = new Promise<unknown>((resolve) => {
        resolveBody.mockImplementationOnce(resolve);
      });
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => body });
      const credentials = new ClientCredentials(defaultOptions);
      const pending = expect(credentials.getAccessToken()).rejects.toMatchObject({
        name: 'ClientCredentialsError',
        cause: { name: 'TimeoutError' },
      });

      await vi.advanceTimersByTimeAsync(10_000);
      await pending;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
      });
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');

      resolveBody({ access_token: 'timed-out-token', expires_in: 3600 });
      await vi.advanceTimersByTimeAsync(0);

      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('invalidateAccessToken', () => {
    it('should allow one invalidation until the refreshed token succeeds', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'old-token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'new-token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'third-token', expires_in: 3600 }),
        });
      const credentials = new ClientCredentials(defaultOptions);
      await credentials.getAccessToken();

      credentials.invalidateAccessToken('old-token');
      const refresh = credentials.getAccessToken();
      credentials.invalidateAccessToken('old-token');
      const tokens = await Promise.all([refresh, credentials.getAccessToken()]);

      expect(tokens.map(({ value }) => value)).toEqual(['new-token', 'new-token']);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // A permanent 401 must not trigger another token fetch.
      credentials.invalidateAccessToken('new-token');
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // A late 401 for the old token must leave the refreshed token cached.
      credentials.invalidateAccessToken('old-token');
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'new-token');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // A successful response re-enables invalidation for a later revocation.
      credentials.markAccessTokenAsValid('new-token');
      credentials.invalidateAccessToken('new-token');
      await expect(credentials.getAccessToken()).resolves.toHaveProperty('value', 'third-token');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
