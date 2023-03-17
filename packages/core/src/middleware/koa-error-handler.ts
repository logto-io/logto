import type { RequestErrorBody } from '@logto/schemas';
import { appInsights } from '@logto/shared/app-insights';
import type { Middleware } from 'koa';
import { HttpError } from 'koa';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

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
        console.error(error);
      }

      if (error instanceof RequestError) {
        ctx.status = error.status;
        ctx.body = error.body;

        if (error.status >= 500) {
          appInsights.trackException(error);
        }

        return;
      }

      // Report unhandled exceptions
      appInsights.trackException(error);

      // Koa will handle `HttpError` with a built-in manner.
      if (error instanceof HttpError) {
        return;
      }

      // Should log 500 errors in prod anyway
      if (EnvSet.values.isProduction) {
        console.error(error);
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
