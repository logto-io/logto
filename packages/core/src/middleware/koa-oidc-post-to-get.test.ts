import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import koaOidcPostToGet from './koa-oidc-post-to-get.js';

const { jest } = import.meta;

const formHeaders = {
  'content-length': '1',
  'content-type': 'application/x-www-form-urlencoded',
};
const requestBody = {
  client_id: 'client-id',
  resource: ['https://api.example.com/1', 'https://api.example.com/2'],
};

describe('koaOidcPostToGet()', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['/auth', '/session/end'])(
    'should forward form POST parameters to the GET handler for %s',
    async (path) => {
      const ctx = createMockContext({
        url: `${path}?original=true`,
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

      await koaOidcPostToGet()(ctx, downstream);

      expect(ctx.method).toBe('POST');
      expect(ctx.querystring).toBe('original=true');
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

    await koaOidcPostToGet()(ctx, next);

    expect(ctx.method).toBe(method);
    expect(ctx.request.query).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should serialize scalar body values the way a form submission would', async () => {
    const ctx = createMockContext({
      url: '/auth',
      method: 'POST',
      headers: formHeaders,
      /** A JSON body (its content type is rewritten to form by the OIDC body parser) may carry scalars. */
      requestBody: { client_id: 'client-id', max_age: 300, require_consent: false },
    });
    const downstream = jest.fn(async () => {
      expect(ctx.method).toBe('GET');
      expect(ctx.request.query).toEqual({
        client_id: 'client-id',
        max_age: '300',
        require_consent: 'false',
      });
    });

    await koaOidcPostToGet()(ctx, downstream);

    expect(downstream).toHaveBeenCalledTimes(1);
  });

  it('should leave a POST with a non-forwardable body unchanged', async () => {
    const ctx = createMockContext({
      url: '/auth',
      method: 'POST',
      headers: formHeaders,
      /** Nested objects cannot be expressed by a form submission. */
      requestBody: { client_id: 'client-id', claims: { userinfo: {} } },
    });

    await koaOidcPostToGet()(ctx, next);

    expect(ctx.method).toBe('POST');
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

    await koaOidcPostToGet()(ctx, next);

    expect(ctx.method).toBe('POST');
    expect(ctx.request.query).toEqual({});
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should restore the POST method and query string when downstream middleware throws', async () => {
    const ctx = createMockContext({
      url: '/auth',
      method: 'POST',
      headers: formHeaders,
      requestBody,
    });
    const error = new Error('downstream error');

    await expect(
      koaOidcPostToGet()(ctx, async () => {
        expect(ctx.method).toBe('GET');
        throw error;
      })
    ).rejects.toBe(error);

    expect(ctx.method).toBe('POST');
    expect(ctx.querystring).toBe('');
  });
});
