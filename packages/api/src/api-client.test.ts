import createClient, { type Middleware } from 'openapi-fetch';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { createApiClient } from './management.js';
import { getAbortReason } from './timeout.js';

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

    expect(result).toMatchObject(mockApiClient);
    expect(result.use).toBe(mockApiClient.use);
  });

  it('should use the default request timeout for NaN', () => {
    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken: async () => 'test-token',
      requestTimeout: Number.NaN,
    });

    expect(mockCreateClient).toHaveBeenCalledWith({
      baseUrl: 'https://test.logto.app',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Vitest's asymmetric matcher accepts any function.
      fetch: expect.any(Function),
    });
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
    const abortError = new DOMException('Request aborted', 'AbortError');
    const mockFetch = vi.fn<typeof fetch>().mockImplementation(
      async (request) =>
        new Promise<Response>((_resolve, reject) => {
          if (!(request instanceof Request)) {
            throw new TypeError('Expected a request');
          }

          request.signal.addEventListener('abort', () => {
            reject(getAbortReason(request.signal, 'Request aborted'));
          });
        })
    );
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

    const result = timeoutFetch(
      new Request('https://test.logto.app/api/users', { signal: requestController.signal }),
      requestInit
    );
    const rejection = expect(result).rejects.toBe(abortError);

    requestController.abort(abortError);
    await rejection;

    expect(timeout).toHaveBeenCalledWith(20_000);
    const calledRequest = mockFetch.mock.calls[0]?.[0];
    expect(calledRequest).toBeInstanceOf(Request);
    expect(calledRequest instanceof Request && calledRequest.signal.aborted).toBe(true);
    expect(mockFetch.mock.calls[0]?.[1]).toMatchObject(requestInit);
  });

  it('should round up sub-millisecond timeouts', async () => {
    const timeoutController = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', mockFetch);
    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken: async () => 'test-token',
      requestTimeout: 0.0005,
    });
    const timeoutFetch = mockCreateClient.mock.calls[0]?.[0]?.fetch;

    if (!timeoutFetch) {
      throw new TypeError('Expected a timeout fetch implementation');
    }

    await timeoutFetch(new Request('https://test.logto.app/api/users'));

    expect(timeout).toHaveBeenCalledWith(1);
  });

  it('should cap timeout signal delays', async () => {
    const timeoutController = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);
    const mockFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', mockFetch);
    createApiClient({
      baseUrl: 'https://test.logto.app',
      getToken: async () => 'test-token',
      requestTimeout: Number.MAX_VALUE,
    });
    const timeoutFetch = mockCreateClient.mock.calls[0]?.[0]?.fetch;

    if (!timeoutFetch) {
      throw new TypeError('Expected a timeout fetch implementation');
    }

    await timeoutFetch(new Request('https://test.logto.app/api/users'));

    expect(timeout).toHaveBeenCalledWith(2_147_483_647);
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
