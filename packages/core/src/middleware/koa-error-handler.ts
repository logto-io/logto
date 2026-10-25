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
 * Reduce an error to what is safe to print.
 *
 * `got` attaches the full request `Options` to its `RequestError` as an **enumerable** property
 * (`request` and `response` are not), so `console.error(error)` dumps the request body. For a
 * social connector's token exchange that body is `code=…&client_id=…&client_secret=…`: one network
 * timeout towards the IdP was enough to print the connector's client secret in plain text in the
 * production logs. Keep the diagnostic value (name, code, message, method, URL, stack) and drop the
 * options.
 */
const toLoggable = (error: unknown): unknown => {
  if (!isGotRequestError(error)) {
    return error;
  }

  const { name, code, message, stack, options } = error;

  return {
    name,
    code,
    message,
    method: options.method,
    url: options.url === undefined ? undefined : String(options.url),
    stack,
  };
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
      if (!EnvSet.values.isUnitTest && !EnvSet.values.isProduction) {
        consoleLog.error(toLoggable(error));
      }

      // Report all exceptions to ApplicationInsights
      void appInsights.trackException(error, buildAppInsightsTelemetry(ctx));

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
        consoleLog.error(toLoggable(error));
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
