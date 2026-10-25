import { ConsoleLog } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import { Options, RequestError as GotRequestError } from 'got';
import createError from 'http-errors';

import RequestError from '#src/errors/RequestError/index.js';

import { createContextWithRouteParameters } from '../utils/test-utils.js';

const { jest } = import.meta;

const httpError = createError(404, 'Not Found');

const { mockEsm } = createMockUtils(jest);

// `isProduction` makes the handler log 500s; `isUnitTest` keeps the fallback console silent for
// the contexts below that do not carry a `console`.
mockEsm('#src/env-set/index.js', () => ({
  EnvSet: { values: { isUnitTest: true, isProduction: true } },
}));

const { default: koaErrorHandler } = await import('./koa-error-handler.js');

describe('koaErrorHandler middleware', () => {
  const mockBody = { data: 'foo' };

  const next = jest.fn().mockReturnValue(Promise.resolve());
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('expect to return error response if error type is RequestError', async () => {
    const ctx = createContextWithRouteParameters({
      customProperties: {
        body: mockBody,
      },
    });
    const error = new RequestError('auth.unauthorized');
    next.mockRejectedValueOnce(error);
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(error.status);
    expect(ctx.body).toEqual(error.toBody(ctx.i18n));
  });

  // Koa will handle `HttpError` with a built-in manner. Hence it needs to return 200 here.
  it('expect to return 200 if error type is HttpError', async () => {
    const ctx = createContextWithRouteParameters({
      customProperties: {
        body: mockBody,
        status: 404,
      },
    });
    next.mockRejectedValueOnce(httpError);
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(404);
  });

  it('expect to return original body if no error found', async () => {
    const ctx = createContextWithRouteParameters({
      customProperties: {
        body: mockBody,
      },
    });
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(200);
    expect(ctx.body).toEqual(mockBody);
  });

  it('expect status 500 if error type is not RequestError', async () => {
    const ctx = createContextWithRouteParameters({
      customProperties: {
        body: mockBody,
      },
    });
    next.mockRejectedValueOnce(new Error('err'));
    await koaErrorHandler()(ctx, next);
    expect(ctx.status).toEqual(500);
  });

  it('expect to log a `got` request error without its request body', async () => {
    const consoleLog = new ConsoleLog();
    const errorLog = jest.spyOn(consoleLog, 'error').mockImplementation(() => {
      // Keep the test output clean
    });
    const ctx = createContextWithRouteParameters({
      customProperties: { body: mockBody, console: consoleLog },
    });
    // What a social connector throws when the token exchange with the IdP times out: `got`
    // keeps the whole request options (including the form body) on the error object.
    const options = new Options({
      method: 'POST',
      url: 'https://oauth2.googleapis.com/token',
      form: { code: 'auth-code', client_id: 'client-id', client_secret: 'super-secret' },
    });
    const error = new GotRequestError('connect ETIMEDOUT', { code: 'ETIMEDOUT' }, options);
    next.mockRejectedValueOnce(error);

    await koaErrorHandler()(ctx, next);

    expect(ctx.status).toEqual(500);
    expect(errorLog).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(errorLog.mock.calls[0]);
    expect(logged).not.toContain('super-secret');
    expect(logged).not.toContain('client_secret');
    expect(logged).toContain('ETIMEDOUT');
    expect(logged).toContain('https://oauth2.googleapis.com/token');
  });
});
