import { appInsights } from '@logto/app-insights/node';
import type { RequestErrorBody } from '@logto/schemas';
import type { Middleware } from 'koa';
import { HttpError } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { consoleLog } from '#src/utils/console.js';

export default function koaErrorHandler<StateT, ContextT, BodyT>(): Middleware<
  StateT,
  ContextT,
  BodyT | RequestErrorBody | { message: string }
> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!EnvSet.values.isProduction) {
        consoleLog.error(error);
      }

      // Report all exceptions to ApplicationInsights
      appInsights.trackException(error);

      if (error instanceof RequestError) {
        ctx.status = error.status;
        ctx.body = error.body;

        return;
      }

      // Koa will handle `HttpError` with a built-in manner.
      if (error instanceof HttpError) {
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
