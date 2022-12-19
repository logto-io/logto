import type { RequestErrorBody } from '@logto/schemas';
import type { Middleware } from 'koa';
import { HttpError } from 'koa';

import envSet from '#src/env-set/index.js';
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
      if (!envSet.values.isProduction) {
        console.error(error);
      }

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
      if (envSet.values.isProduction) {
        console.error(error);
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
