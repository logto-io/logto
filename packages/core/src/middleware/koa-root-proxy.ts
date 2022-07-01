import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';

export default function koaRootProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Empty path return 404
    if (requestPath === '/') {
      ctx.redirect('/welcome');

      return;
    }

    return next();
  };
}
