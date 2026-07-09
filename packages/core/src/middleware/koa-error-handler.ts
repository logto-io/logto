import { appInsights } from '@logto/app-insights/node';
import type { RequestErrorBody } from '@logto/schemas';
import { isHttpError } from 'http-errors';
import type { Middleware } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';

import { type WithI18nContext } from './koa-i18next.js';

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
        consoleLog.error(error);
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
        consoleLog.error(error);
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
