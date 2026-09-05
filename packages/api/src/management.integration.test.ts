import { afterEach, describe, expect, it, vi } from 'vitest';

import { createManagementApi } from './management.js';
import { getAbortReason } from './timeout.js';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('Management API token recovery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should use a fresh token on the request after a 401', async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'rejected-token', expires_in: 3600, scope: 'all' })
      )
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'fresh-token', expires_in: 3600, scope: 'all' })
      )
      .mockResolvedValueOnce(jsonResponse([]));
    vi.stubGlobal('fetch', mockFetch);
    const { apiClient } = createManagementApi('test-tenant', {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });

    const firstResult = await apiClient.get('/api/users' as never);
    const secondResult = await apiClient.get('/api/users' as never);

    expect(firstResult.response.status).toBe(401);
    expect(secondResult.response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(4);

    const firstRequest = mockFetch.mock.calls[1]?.[0];
    const secondRequest = mockFetch.mock.calls[3]?.[0];
    expect(firstRequest).toBeInstanceOf(Request);
    expect(secondRequest).toBeInstanceOf(Request);

    if (!(firstRequest instanceof Request) || !(secondRequest instanceof Request)) {
      throw new TypeError('Expected Management API requests');
    }

    expect(firstRequest.headers.get('Authorization')).toBe('Bearer rejected-token');
    expect(secondRequest.headers.get('Authorization')).toBe('Bearer fresh-token');
  });

  it('should reuse the replacement token when the API keeps returning 401', async () => {
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'first-token', expires_in: 3600, scope: 'all' })
      )
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'replacement-token', expires_in: 3600, scope: 'all' })
      )
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: 'Unauthorized' }, 401));
    vi.stubGlobal('fetch', mockFetch);
    const { apiClient } = createManagementApi('test-tenant', {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });

    const firstResult = await apiClient.get('/api/users' as never);
    const secondResult = await apiClient.get('/api/users' as never);
    const thirdResult = await apiClient.get('/api/users' as never);

    expect([firstResult, secondResult, thirdResult].map(({ response }) => response.status)).toEqual(
      [401, 401, 401]
    );
    expect(mockFetch).toHaveBeenCalledTimes(5);

    const apiRequests = [
      mockFetch.mock.calls[1]?.[0],
      mockFetch.mock.calls[3]?.[0],
      mockFetch.mock.calls[4]?.[0],
    ];
    expect(apiRequests.every((request) => request instanceof Request)).toBe(true);
    expect(
      apiRequests.map((request) =>
        request instanceof Request ? request.headers.get('Authorization') : undefined
      )
    ).toEqual(['Bearer first-token', 'Bearer replacement-token', 'Bearer replacement-token']);
  });

  it('should apply the client request timeout to Management API calls', async () => {
    const timeoutController = new AbortController();
    const timeoutError = new DOMException('Request timed out', 'TimeoutError');
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const mockFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ access_token: 'test-token', expires_in: 3600, scope: 'all' })
      )
      .mockImplementationOnce(
        async (_request, requestInit) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = requestInit?.signal;

            if (!(signal instanceof AbortSignal)) {
              throw new TypeError('Expected a Management API request signal');
            }
            signal.addEventListener('abort', () => {
              reject(getAbortReason(signal, 'Management API request aborted'));
            });
          })
      );
    vi.stubGlobal('fetch', mockFetch);
    const { apiClient } = createManagementApi('test-tenant', {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      requestTimeout: 20,
    });
    const result = apiClient.get('/api/users' as never);
    const rejection = expect(result).rejects.toBe(timeoutError);
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(timeout).toHaveBeenCalledWith(20_000);
    timeoutController.abort(timeoutError);
    await rejection;
  });
});
