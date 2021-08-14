import assert from 'assert';
import RequestError from '@/errors/RequestError';
import { RequestErrorBody } from '@logto/schemas';
import { Middleware } from 'koa';

const bearerToken = 'Bearer';

export default function koaAuth<StateT, ContextT>(): Middleware<
  StateT,
  ContextT,
  RequestErrorBody
> {
  return async (ctx, next) => {
    const { authorization } = ctx.request.headers;
    assert(
      authorization,
      new RequestError({ code: 'auth.authorization_header_missing', status: 401 })
    );
    assert(
      authorization.startsWith(bearerToken),
      new RequestError(
        { code: 'auth.authorization_type_not_supported', status: 401 },
        { supportedTypes: [bearerToken] }
      )
    );
    return next();
  };
}
