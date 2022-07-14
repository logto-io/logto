import { RequestErrorBody } from '@logto/schemas';
import { Middleware } from 'koa';

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
      if (error instanceof RequestError) {
        ctx.status = error.status;
        ctx.body = error.body;

        return;
      }

      ctx.status = 500;
      ctx.body = { message: 'Internal server error.' };
    }
  };
}
