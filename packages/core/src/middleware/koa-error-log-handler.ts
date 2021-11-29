import { RequestErrorBody } from '@logto/schemas';
import { Middleware } from 'koa';

import { RequestErrorWithUserLog } from '@/errors/RequestError';
import { insertUserLog } from '@/queries/user-log';

export default function koaErrorLogHandler<StateT, ContextT>(): Middleware<
  StateT,
  ContextT,
  RequestErrorBody
> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof RequestErrorWithUserLog)) {
        throw error;
      }

      await insertUserLog(error.payload);

      // Throw it to next middleware
      throw error;
    }
  };
}
