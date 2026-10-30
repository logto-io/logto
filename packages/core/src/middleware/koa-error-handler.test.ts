import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
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

const trackException = jest.fn();
mockEsm('@logto/app-insights/node', () => ({
  appInsights: { trackException },
}));

const { default: koaErrorHandler } = await import('./koa-error-handler.js');

const mockBody = { data: 'foo' };

const createContext = () => {
  const consoleLog = new ConsoleLog();
  const errorLog = jest.spyOn(consoleLog, 'error').mockImplementation(() => {
    // Keep the test output clean
  });
  const ctx = createContextWithRouteParameters({
    customProperties: { body: mockBody, console: consoleLog },
  });

  return { ctx, errorLog };
};

/** Stringify with the own properties of every `Error` met, like the telemetry sink does. */
const serialize = (value: unknown) =>
  JSON.stringify(value, (_, value: unknown) =>
    value instanceof Error
      ? Object.fromEntries(
          Object.getOwnPropertyNames(value).map((key) => [key, Reflect.get(value, key)])
        )
      : value
  );

describe('koaErrorHandler middleware', () => {
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

  describe('outbound `got` request errors', () => {
    it('expect to log a `got` request error without its request body', async () => {
      const { ctx, errorLog } = createContext();
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
      const logged = serialize(errorLog.mock.calls[0]);
      expect(logged).not.toContain('super-secret');
      expect(logged).not.toContain('client_secret');
      expect(logged).toContain('ETIMEDOUT');
      expect(logged).toContain('https://oauth2.googleapis.com/token');

      // The telemetry sink serializes every property of what it receives: same payload.
      expect(trackException).toHaveBeenCalledTimes(1);
      const tracked = serialize(trackException.mock.calls[0]);
      expect(tracked).not.toContain('super-secret');
      expect(tracked).toContain('ETIMEDOUT');
    });

    it('expect to log the URL of a `got` request error without its query string', async () => {
      const { ctx, errorLog } = createContext();
      // Some connectors exchange their code through the query string.
      const options = new Options({
        method: 'GET',
        url: 'https://graph.facebook.com/v13.0/oauth/access_token',
        searchParams: { code: 'auth-code', client_id: 'client-id', client_secret: 'super-secret' },
      });
      const error = new GotRequestError('Timeout awaiting request', { code: 'ETIMEDOUT' }, options);
      next.mockRejectedValueOnce(error);

      await koaErrorHandler()(ctx, next);

      const logged = serialize(errorLog.mock.calls[0]);
      expect(logged).not.toContain('super-secret');
      expect(logged).not.toContain('auth-code');
      expect(logged).toContain('https://graph.facebook.com/v13.0/oauth/access_token');
      expect(serialize(trackException.mock.calls[0])).not.toContain('super-secret');
    });

    it('expect to log a connector error wrapping a `got` request error without the request', async () => {
      const { ctx, errorLog } = createContext();
      // What an email connector throws when its provider times out:
      // `new ConnectorError(ConnectorErrorCodes.General, error)`. The connector error stringifies
      // its `data` into its own message.
      const options = new Options({
        method: 'POST',
        url: 'https://api.sendgrid.com/v3/mail/send',
        headers: { Authorization: 'Bearer sendgrid-api-key' },
        username: 'api',
        password: 'mailgun-api-key',
        json: { personalizations: [{ to: [{ email: 'foo@bar.com' }] }] },
      });
      const gotError = new GotRequestError(
        'Timeout awaiting request',
        { code: 'ETIMEDOUT' },
        options
      );
      const error = new ConnectorError(ConnectorErrorCodes.General, gotError);
      expect(error.message).toContain('sendgrid-api-key');
      next.mockRejectedValueOnce(error);

      await koaErrorHandler()(ctx, next);

      expect(ctx.status).toEqual(500);
      expect(errorLog).toHaveBeenCalledTimes(1);
      const logged = serialize(errorLog.mock.calls[0]);
      expect(logged).not.toContain('sendgrid-api-key');
      expect(logged).not.toContain('mailgun-api-key');
      expect(logged).not.toContain('foo@bar.com');
      expect(logged).toContain('ConnectorError');
      expect(logged).toContain(ConnectorErrorCodes.General);
      expect(logged).toContain('ETIMEDOUT');
      expect(logged).toContain('https://api.sendgrid.com/v3/mail/send');

      const tracked = serialize(trackException.mock.calls[0]);
      expect(tracked).not.toContain('sendgrid-api-key');
      expect(tracked).not.toContain('mailgun-api-key');
      expect(tracked).toContain('ETIMEDOUT');
    });

    it('expect to export a request error wrapping a `got` request error without the request', async () => {
      const { ctx } = createContext();
      // What reaches this middleware once the connector error handler has translated the
      // connector error above: a `RequestError` whose `data` is still the `got` error.
      const options = new Options({
        method: 'POST',
        url: 'https://api.mailgun.net/v3/example.com/messages',
        username: 'api',
        password: 'mailgun-api-key',
        form: { to: 'foo@bar.com' },
      });
      const gotError = new GotRequestError(
        'Timeout awaiting request',
        { code: 'ETIMEDOUT' },
        options
      );
      const error = new RequestError(
        { code: 'connector.general', status: 400, errorDescription: JSON.stringify(gotError) },
        gotError
      );
      next.mockRejectedValueOnce(error);

      await koaErrorHandler()(ctx, next);

      expect(ctx.status).toEqual(400);
      // What the end user's browser receives
      const body = JSON.stringify(ctx.body);
      expect(body).not.toContain('mailgun-api-key');
      expect(body).not.toContain('foo@bar.com');
      expect(body).toContain('connector.general');
      expect(body).toContain('Timeout awaiting request');

      expect(trackException).toHaveBeenCalledTimes(1);
      const tracked = serialize(trackException.mock.calls[0]);
      expect(tracked).not.toContain('mailgun-api-key');
      expect(tracked).not.toContain('foo@bar.com');
      expect(tracked).toContain('connector.general');
      expect(tracked).toContain('ETIMEDOUT');
      expect(tracked).toContain('https://api.mailgun.net/v3/example.com/messages');
    });
  });
});
