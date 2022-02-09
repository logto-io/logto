import { RequestErrorBody } from '@logto/schemas';
import { Middleware } from 'koa';

import RequestError from '@/errors/RequestError';

export default function koaErrorHandler<StateT, ContextT>(): Middleware<
  StateT,
  ContextT,
  RequestErrorBody
> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (error instanceof RequestError) {
        ctx.status = error.status;
        ctx.body = error.body;

        return;
      }

      throw error;
    }
  };
}
