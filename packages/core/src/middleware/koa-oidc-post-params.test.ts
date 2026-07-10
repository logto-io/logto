import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import koaOidcPostParams from './koa-oidc-post-params.js';

const { jest } = import.meta;

const formHeaders = {
  'content-length': '1',
  'content-type': 'application/x-www-form-urlencoded',
};
const requestBody = {
  client_id: 'client-id',
  resource: ['https://api.example.com/1', 'https://api.example.com/2'],
};

describe('koaOidcPostParams()', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['/auth', '/session/end'])(
    'should forward form POST parameters to the GET handler for %s',
    async (path) => {
      const ctx = createMockContext({
        url: path,
        method: 'POST',
        headers: formHeaders,
        requestBody,
      });
      const downstream = jest.fn(async () => {
        expect(ctx.method).toBe('GET');
        expect(ctx.request.query).toEqual(requestBody);
        expect(ctx.querystring).toBe(
          'client_id=client-id&resource=https%3A%2F%2Fapi.example.com%2F1&resource=https%3A%2F%2Fapi.example.com%2F2'
        );
      });

      await koaOidcPostParams()(ctx, downstream);

      expect(ctx.method).toBe('POST');
      expect(downstream).toHaveBeenCalledTimes(1);
    }
  );

  it.each([
    ['GET', '/auth'],
    ['POST', '/token'],
    ['POST', '/session/end/confirm'],
  ] as const)('should leave %s %s unchanged', async (method, path) => {
    const ctx = createMockContext({
      url: path,
      method,
      headers: formHeaders,
      requestBody,
    });

    await koaOidcPostParams()(ctx, next);

    expect(ctx.method).toBe(method);
    expect(ctx.request.query).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should leave a non-form POST unchanged', async () => {
    const ctx = createMockContext({
      url: '/auth',
      method: 'POST',
      headers: { 'content-length': '1', 'content-type': 'text/plain' },
      requestBody,
    });

    await koaOidcPostParams()(ctx, next);

    expect(ctx.method).toBe('POST');
    expect(ctx.request.query).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should restore the POST method when downstream middleware throws', async () => {
    const ctx = createMockContext({
      url: '/auth',
      method: 'POST',
      headers: formHeaders,
      requestBody,
    });
    const error = new Error('downstream error');

    await expect(
      koaOidcPostParams()(ctx, async () => {
        expect(ctx.method).toBe('GET');
        throw error;
      })
    ).rejects.toBe(error);

    expect(ctx.method).toBe('POST');
  });
});
