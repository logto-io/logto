import createClient, { type Middleware } from 'openapi-fetch';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createApiClient } from './management.js';

vi.mock('openapi-fetch');

const mockCreateClient = vi.mocked(createClient);

describe('createApiClient', () => {
  const mockApiClient = {
    use: vi.fn<(...middleware: Middleware[]) => void>(),
    GET: vi.fn(),
    PUT: vi.fn(),
    POST: vi.fn(),
    DELETE: vi.fn(),
    OPTIONS: vi.fn(),
    HEAD: vi.fn(),
    PATCH: vi.fn(),
    TRACE: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error -- Only the middleware registration is needed by these tests.
    mockCreateClient.mockReturnValue(mockApiClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create API client with provided options', () => {
    const getToken = vi.fn().mockResolvedValue('test-token');

    const result = createApiClient({
      baseUrl: 'https://test.logto.app///',
      getToken,
    });

    expect(mockCreateClient).toHaveBeenCalledWith({
      baseUrl: 'https://test.logto.app',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest's asymmetric matcher accepts any function.
      fetch: expect.any(Function),
    });

    expect(result).toBe(mockApiClient);
  });

  it.each([0, -1, Number.POSITIVE_INFINITY])(
    'should disable the request timeout for %s',
    (requestTimeout) => {
      createApiClient({
        baseUrl: 'https://test.logto.app',
        getToken: async () => 'test-token',
        requestTimeout,
      });

      expect(mockCreateClient).toHaveBeenCalledWith({ baseUrl: 'https://test.logto.app' });
    }
  );

  it('should compose the request timeout with a per-request signal', async () => {
    const timeoutController = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', mockFetch);
    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken: async () => 'test-token',
      requestTimeout: 20,
    });
    const clientOptions = mockCreateClient.mock.calls[0]?.[0];
    expect(clientOptions?.fetch).toBeTypeOf('function');
    const requestController = new AbortController();
    const requestInit = { cache: 'no-store' as const };
    const timeoutFetch = clientOptions?.fetch as
      | ((request: Request, requestInit?: RequestInit) => Promise<Response>)
      | undefined;

    if (!timeoutFetch) {
      throw new TypeError('Expected a timeout fetch implementation');
    }

    const request = new Request('https://test.logto.app/api/users', {
      signal: requestController.signal,
    });
    await timeoutFetch(request, requestInit);

    expect(timeout).toHaveBeenCalledWith(20_000);
    expect(mockFetch.mock.calls[0]?.[0]).toBe(request);
    const forwardedInit = mockFetch.mock.calls[0]?.[1];
    expect(forwardedInit).toMatchObject(requestInit);
    expect(forwardedInit?.signal).toBeInstanceOf(AbortSignal);
    expect(forwardedInit?.signal).not.toBe(requestController.signal);

    const abortError = new DOMException('Request aborted', 'AbortError');
    requestController.abort(abortError);
    expect(forwardedInit?.signal?.aborted).toBe(true);
    expect(forwardedInit?.signal?.reason).toBe(abortError);
  });

  it.each([
    ['get', 'GET'],
    ['put', 'PUT'],
    ['post', 'POST'],
    ['delete', 'DELETE'],
    ['options', 'OPTIONS'],
    ['head', 'HEAD'],
    ['patch', 'PATCH'],
    ['trace', 'TRACE'],
  ] as const)('should expose %s as an alias of %s', (lowercaseMethod, uppercaseMethod) => {
    const client = createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken: async () => 'test-token',
    });

    expect(client[lowercaseMethod]).toBe(mockApiClient[uppercaseMethod]);
  });

  it('should configure middleware correctly', async () => {
    const getToken = vi.fn().mockResolvedValue('test-token');

    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken,
    });

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

    expect(getToken).toHaveBeenCalled();
    expect(mockRequest.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer test-token');
    expect(result).toBe(mockRequest);
  });

  it('should skip auth for well-known endpoints', async () => {
    const getToken = vi.fn().mockResolvedValue('test-token');

    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken,
    });

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

    expect(getToken).not.toHaveBeenCalled();
    expect(mockRequest.headers.set).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
