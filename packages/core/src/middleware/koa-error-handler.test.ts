import createError from 'http-errors';

import RequestError from '#src/errors/RequestError/index.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

import koaErrorHandler from './koa-error-handler.js';

const { jest } = import.meta;

const httpError = createError(404, 'Not Found');

describe('koaErrorHandler middleware', () => {
  const mockBody = { data: 'foo' };

  const ctx = createMockContext({
    customProperties: {
      body: mockBody,
    },
  });

  const next = jest.fn().mockReturnValue(Promise.resolve());

  beforeEach(() => {
    ctx.body = mockBody;
    ctx.status = 200;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('expect to return error response if error type is RequestError', async () => {
    const error = new RequestError('auth.unauthorized');
    next.mockRejectedValueOnce(error);
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(error.status);
    expect(ctx.body).toEqual(error.body);
  });

  // Koa will handle `HttpError` with a built-in manner. Hence it needs to return 200 here.
  it('expect to return 200 if error type is HttpError', async () => {
    next.mockRejectedValueOnce(httpError);
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(200);
  });

  it('expect to return orginal body if not error found', async () => {
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(200);
    expect(ctx.body).toEqual(mockBody);
  });

  it('expect status 500 if error type is not RequestError', async () => {
    next.mockRejectedValueOnce(new Error('err'));
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(500);
  });
});
