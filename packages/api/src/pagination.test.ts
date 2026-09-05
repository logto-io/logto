import type { Client } from 'openapi-fetch';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { createPaginate, ManagementApiPaginationError } from './pagination.js';

type User = {
  id: string;
};

type TestPaths = {
  '/api/users': {
    get: {
      parameters: {
        query?: {
          page?: number;
          page_size?: number;
          search?: string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': User[];
          };
        };
      };
    };
  };
  '/api/organizations/{id}/users': {
    get: {
      parameters: {
        path: {
          id: string;
        };
        query?: {
          page?: number;
          page_size?: number;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': User[];
          };
        };
      };
    };
  };
  '/api/status': {
    get: {
      parameters: {
        query?: {
          page?: number;
          page_size?: number;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': { status: string };
          };
        };
      };
    };
  };
  '/api/unpaginated-users': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': User[];
          };
        };
      };
    };
  };
};

const createResponse = (headers?: HeadersInit, status = 200) =>
  new Response(null, { headers, status });

const collect = async <Item>(iterator: AsyncGenerator<Item, void, undefined>) => {
  const collectRemaining = async (items: Item[]): Promise<Item[]> => {
    const result = await iterator.next();

    return result.done ? items : collectRemaining([...items, result.value]);
  };

  return collectRemaining([]);
};

describe('createPaginate', () => {
  it('should infer the item type and only accept paginated array endpoints', () => {
    const get = vi.fn();
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    expectTypeOf(paginate('/api/users')).toEqualTypeOf<AsyncGenerator<User, void, undefined>>();
    expectTypeOf<Parameters<typeof paginate>[0]>().toEqualTypeOf<
      '/api/users' | '/api/organizations/{id}/users'
    >();

    const assertInvalidCalls = () => {
      // @ts-expect-error -- A paginated endpoint with a non-array response is excluded.
      paginate('/api/status');
      // @ts-expect-error -- An array endpoint without page parameters is excluded.
      paginate('/api/unpaginated-users');
      // @ts-expect-error -- Parsing as another body type would invalidate the yielded item type.
      paginate('/api/users', { parseAs: 'stream' });
      // @ts-expect-error -- Unknown top-level request options should not be silently accepted.
      paginate('/api/users', { signl: new AbortController().signal });
    };

    expectTypeOf(assertInvalidCalls).toBeFunction();
  });

  it('should preserve request options and follow next links', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 'user-1' }, { id: 'user-2' }],
        response: createResponse({
          Link: [
            '<https://example.com/api/users?page=1&page_size=2>; rel="first"',
            '<https://example.com/api/users?page=1&page_size=2>; rel="prev"',
            '<https://example.com/api/users?page=3&page_size=2>; rel="last"',
            '<https://example.com/api/users?page=3&page_size=2>; rel="next"',
          ].join(', '),
        }),
      })
      .mockResolvedValueOnce({
        data: [{ id: 'user-3' }],
        response: createResponse({
          Link: [
            '<https://example.com/api/users?page=1&page_size=2>; rel="first"',
            '<https://example.com/api/users?page=2&page_size=2>; rel="prev"',
            '<https://example.com/api/users?page=3&page_size=2>; rel="last"',
          ].join(', '),
        }),
      });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);
    const { signal } = new AbortController();

    const users = await collect(
      paginate('/api/users', {
        params: { query: { page: 2, page_size: 2, search: 'alice' } },
        headers: { 'X-Test': 'value' },
        signal,
      })
    );

    expect(users).toEqual([{ id: 'user-1' }, { id: 'user-2' }, { id: 'user-3' }]);
    expect(get).toHaveBeenNthCalledWith(1, '/api/users', {
      params: { query: { page: 2, page_size: 2, search: 'alice' } },
      headers: { 'X-Test': 'value' },
      signal,
    });
    expect(get).toHaveBeenNthCalledWith(2, '/api/users', {
      params: { query: { page: 3, page_size: 2, search: 'alice' } },
      headers: { 'X-Test': 'value' },
      signal,
    });
  });

  it('should use a page size of 100 by default', async () => {
    const get = vi.fn().mockResolvedValue({ data: [], response: createResponse() });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    await collect(paginate('/api/users'));

    expect(get).toHaveBeenCalledWith('/api/users', {
      params: { query: { page: 1, page_size: 100 } },
    });
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    0,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
  ])('should reject invalid starting page %s', (page) => {
    const get = vi.fn();
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    expect(() => paginate('/api/users', { params: { query: { page } } })).toThrowError(
      new RangeError('The page parameter must be a positive safe integer')
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('should continue capped pagination until an empty page', async () => {
    const cappedHeaders = { 'Total-Number-Is-Capped': 'true' };
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 'user-21' }],
        response: createResponse(cappedHeaders),
      })
      .mockResolvedValueOnce({
        data: [{ id: 'user-22' }],
        response: createResponse(cappedHeaders),
      })
      .mockResolvedValueOnce({
        data: [],
        response: createResponse(cappedHeaders),
      });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    const users = await collect(
      paginate('/api/users', { params: { query: { page: 21, page_size: 1 } } })
    );

    expect(users).toEqual([{ id: 'user-21' }, { id: 'user-22' }]);
    expect(get.mock.calls.map(([, options]) => options.params.query.page)).toEqual([21, 22, 23]);
  });

  it('should preserve required path parameters', async () => {
    const get = vi.fn().mockResolvedValue({ data: [], response: createResponse() });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    await collect(
      paginate('/api/organizations/{id}/users', {
        params: { path: { id: 'organization-id' } },
      })
    );

    expect(get).toHaveBeenCalledWith('/api/organizations/{id}/users', {
      params: {
        path: { id: 'organization-id' },
        query: { page: 1, page_size: 100 },
      },
    });
  });

  it('should throw a structured pagination error for API error responses', async () => {
    const apiError = { code: 'auth.unauthorized' };
    const response = createResponse(undefined, 401);
    const get = vi.fn().mockResolvedValue({
      error: apiError,
      response,
    });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    try {
      await collect(paginate('/api/users'));
      throw new Error('Expected pagination to reject');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ManagementApiPaginationError);
      expect(error).toMatchObject({
        name: 'ManagementApiPaginationError',
        message: 'Management API pagination request failed with status 401',
        cause: apiError,
        response,
        status: 401,
      });
    }
  });

  it('should expose the response when an API error has no body', async () => {
    const response = createResponse(undefined, 500);
    const get = vi.fn().mockResolvedValue({ error: undefined, response });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    try {
      await collect(paginate('/api/users'));
      throw new Error('Expected pagination to reject');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ManagementApiPaginationError);
      expect(error).toMatchObject({ cause: undefined, response, status: 500 });
    }
  });

  it('should reject parseAs at runtime', () => {
    const get = vi.fn();
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    expect(() => paginate('/api/users', { parseAs: 'stream' } as never)).toThrow(
      'The paginate method only supports JSON array responses'
    );
    expect(get).not.toHaveBeenCalled();
  });

  it('should propagate request failures unchanged', async () => {
    const abortError = new DOMException('Request aborted', 'AbortError');
    const get = vi.fn().mockRejectedValue(abortError);
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    await expect(collect(paginate('/api/users'))).rejects.toBe(abortError);
  });

  it('should reject a response that does not contain an array', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { id: 'user-1' },
      response: createResponse(),
    });
    const paginate = createPaginate<TestPaths>(get as Client<TestPaths>['GET']);

    await expect(collect(paginate('/api/users'))).rejects.toThrow(
      'Expected a paginated Management API response to contain an array'
    );
  });
});
