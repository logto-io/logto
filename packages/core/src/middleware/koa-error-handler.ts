import { appInsights } from '@logto/app-insights/node';
import type { RequestErrorBody } from '@logto/schemas';
import { isHttpError } from 'http-errors';
import type { Middleware } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { type WithI18nContext } from './koa-i18next.js';

/** The slice of a `got` `RequestError` this module reads. */
type GotRequestErrorLike = Error & {
  code: string;
  options: { method: string; url?: URL | string };
};

/**
 * Duck-typed check for a `got` `RequestError` (and its subclasses: `TimeoutError`, `HTTPError`…).
 * Connectors ship their own copy of `got`, so an `instanceof` check against core's copy would
 * silently miss the errors thrown from a connector package.
 */
const isGotRequestError = (error: unknown): error is GotRequestErrorLike =>
  error instanceof Error &&
  'code' in error &&
  typeof error.code === 'string' &&
  'options' in error &&
  typeof error.options === 'object' &&
  error.options !== null &&
  'method' in error.options &&
  typeof error.options.method === 'string';

/**
 * An error that carries a `got` `RequestError` as its `data`: `ConnectorError` when a connector
 * wraps the failed request (`new ConnectorError(ConnectorErrorCodes.General, error)`), and the
 * `RequestError` the connector error handler builds from it. Both serialize `data` into their
 * `message`, so the message itself has to be rebuilt.
 */
type WrappedGotRequestError = Error & { code?: unknown; data: GotRequestErrorLike };

const isWrappedGotRequestError = (error: unknown): error is WrappedGotRequestError =>
  error instanceof Error && 'data' in error && isGotRequestError(error.data);

/**
 * Origin and pathname only. Several connectors send their token exchange through the query string
 * (`client_secret`, `code`, `fb_exchange_token`…), and a URL can also carry basic credentials.
 */
const toSafeUrl = (url: URL | string | undefined): string | undefined => {
  if (url === undefined) {
    return undefined;
  }

  try {
    const { origin, pathname } = new URL(String(url));
    return origin + pathname;
  } catch {
    return undefined;
  }
};

/** The stack frames of an error, without its first line (`${name}: ${message}`). */
const stackFramesOf = (stack: string | undefined): string => {
  if (stack === undefined) {
    return '';
  }

  const index = stack.indexOf('\n    at ');
  return index === -1 ? '' : stack.slice(index);
};

type SafeErrorInput = {
  name: string;
  stack?: string;
  code?: string;
  method?: string;
  url?: string;
  data?: Error;
};

/**
 * What remains of an error once reduced to what is safe to print or export: name, message, code,
 * the method and URL of the failed request, the stack frames. The stack is rebuilt because its
 * first line repeats the original message.
 */
class SafeError extends Error {
  code?: string;
  method?: string;
  url?: string;
  data?: Error;

  constructor(message: string, { name, stack, code, method, url, data }: SafeErrorInput) {
    super(message);
    this.name = name;
    this.stack = `${name}: ${message}${stackFramesOf(stack)}`;
    this.code = code;
    this.method = method;
    this.url = url;
    this.data = data;
  }
}

/**
 * Keep the diagnostic value of a `got` error (name, code, message, method, URL, stack) and drop
 * its `options`.
 */
const toSafeGotRequestError = (error: GotRequestErrorLike): SafeError =>
  new SafeError(error.message, {
    name: error.name,
    stack: error.stack,
    code: error.code,
    method: error.options.method,
    url: toSafeUrl(error.options.url),
  });

/**
 * Reduce an error to what is safe to print or export.
 *
 * `got` attaches the full request `Options` to its `RequestError` as an **enumerable** property
 * (`request` and `response` are not), so `console.error(error)` dumps the request: the form body
 * of a social connector's token exchange (`code=…&client_id=…&client_secret=…`), the
 * `Authorization` header or the basic-auth password of an email connector, the query string of
 * the connectors that exchange their code through it. One network timeout towards the provider
 * was enough to print the connector's secret in plain text in the production logs.
 *
 * The same request options travel inside the errors that wrap a `got` error as `data`
 * (`ConnectorError`, then the `RequestError` built from it): `JSON.stringify(data)` lands in their
 * `message`, and Application Insights serializes every property of what it receives.
 */
export const sanitizeError = (error: unknown): unknown => {
  if (isGotRequestError(error)) {
    return toSafeGotRequestError(error);
  }

  if (isWrappedGotRequestError(error)) {
    const data = toSafeGotRequestError(error.data);
    const code = typeof error.code === 'string' ? error.code : undefined;
    // `ConnectorError` does not set its `name`
    const name = error.name === 'Error' ? error.constructor.name : error.name;

    return new SafeError(`${name}${code ? ` (${code})` : ''}: ${data.message}`, {
      name,
      stack: error.stack,
      code,
      data,
    });
  }

  return error;
};

/**
 * The middleware to handle errors.
 *
 * Note: A context-aware console log is required to be present in the context (i.e. `ctx.console`).
 */
export default function koaErrorHandler<
  StateT,
  ContextT extends WithI18nContext,
  BodyT,
>(): Middleware<StateT, ContextT, BodyT | RequestErrorBody | { message: string }> {
  return async (ctx, next) => {
    const consoleLog = getConsoleLogFromContext(ctx);

    try {
      await next();
    } catch (error: unknown) {
      const loggable = sanitizeError(error);

      if (!EnvSet.values.isUnitTest && !EnvSet.values.isProduction) {
        consoleLog.error(loggable);
      }

      // Report all exceptions to ApplicationInsights
      void appInsights.trackException(loggable, buildAppInsightsTelemetry(ctx));

      if (error instanceof RequestError) {
        ctx.status = error.status;
        ctx.body = error.toBody(ctx.i18n);

        return;
      }

      /**
       * Koa handles `HttpError` natively. Use the duck-typed `isHttpError` instead of
       * `instanceof HttpError` — with multiple `http-errors` majors in the dependency tree, an
       * `instanceof` check against the wrong copy silently fails.
       */
      if (isHttpError(error)) {
        return;
      }

      // Expose JSON body parsing errors
      if (error instanceof SyntaxError) {
        ctx.status = 400;
        ctx.body = { message: error.message };
        return;
      }

      // Should log 500 errors in prod anyway
      if (EnvSet.values.isProduction) {
        consoleLog.error(loggable);
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
