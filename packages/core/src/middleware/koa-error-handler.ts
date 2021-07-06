import RequestError, { RequestErrorBody } from '@/errors/RequestError';
import { Middleware } from 'koa';

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
