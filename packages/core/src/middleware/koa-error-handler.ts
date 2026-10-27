import { appInsights } from '@logto/app-insights/node';
import type { LogtoErrorI18nKey } from '@logto/phrases';
import type { RequestErrorBody } from '@logto/schemas';
import { isHttpError } from 'http-errors';
import type { Middleware } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getConsoleLogFromContext } from '#src/utils/console.js';
import { buildAppInsightsTelemetry } from '#src/utils/request.js';
import {
  isGotRequestError,
  sanitizeError,
  toSafeConnectorErrorData,
} from '#src/utils/sanitize-error.js';

import { type WithI18nContext } from './koa-i18next.js';

const toSafeBody = (body: RequestErrorBody, i18n: WithI18nContext['i18n']): RequestErrorBody => {
  const data = toSafeConnectorErrorData(body.data);

  return {
    ...body,
    data,
    message: i18n.t<string, LogtoErrorI18nKey>(`errors:${body.code}`, {
      ...(typeof data === 'object' && data !== null ? data : {}),
      interpolation: { escapeValue: false },
    }),
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
      const loggable = sanitizeError(error);

      if (!EnvSet.values.isUnitTest && !EnvSet.values.isProduction) {
        consoleLog.error(loggable);
      }

      // Report all exceptions to ApplicationInsights
      void appInsights.trackException(loggable, buildAppInsightsTelemetry(ctx));

      if (error instanceof RequestError) {
        ctx.status = error.status;
        const body = error.toBody(ctx.i18n);
        // `koaConnectorErrorHandler` reduces a `got` error before it becomes `data`; this is the
        // belt for a `RequestError` built elsewhere with the raw error, whose message may also
        // have been interpolated with it.
        ctx.body = isGotRequestError(body.data) ? toSafeBody(body, ctx.i18n) : body;

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
