import { RequestErrorBody } from '@logto/schemas';
import { HttpError, Middleware } from 'koa';

import envSet from '@/env-set';
import RequestError from '@/errors/RequestError';

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

      if (error instanceof HttpError) {
        return;
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
