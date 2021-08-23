import RequestError from '@/errors/RequestError';
import { RequestErrorBody } from '@logto/schemas';
import { LogtoErrorCode } from '@logto/phrases';
import decamelize from 'decamelize';
import { Middleware } from 'koa';
import { errors } from 'oidc-provider';

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

      if (error instanceof errors.OIDCProviderError) {
        ctx.status = error.status;
        ctx.body = {
          message: error.error_description ?? error.message,
          // Assert error type of OIDCProviderError, code key should all covered in @logto/phrases
          code: `oidc.${decamelize(error.name)}` as LogtoErrorCode,
          data: error.error_detail,
        };
        return;
      }

      throw error;
    }
  };
}
