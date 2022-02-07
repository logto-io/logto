import { RequestErrorBody } from '@logto/schemas';
import { Middleware } from 'koa';
import { errors } from 'oidc-provider';
import { NotFoundError } from 'slonik';

import OIDCRequestError from '@/errors/OIDCRequestError';
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

      if (error instanceof errors.OIDCProviderError) {
        const oidcError = new OIDCRequestError(error);
        ctx.status = oidcError.status;
        ctx.body = oidcError.body;

        return;
      }

      // TODO: Slonik Error
      if (error instanceof NotFoundError) {
        const error = new RequestError({ code: 'entity.not_found', status: 404 });
        ctx.status = error.status;
        ctx.body = error.body;

        return;
      }

      // TODO: Zod Error

      throw error;
    }
  };
}
