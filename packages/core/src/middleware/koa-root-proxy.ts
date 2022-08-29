import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';

import envSet from '@/env-set';
import { appendPath } from '@/utils/url';

export default function koaRootProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { endpoint } = envSet.values;

  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Redirect root path to the Admin Console welcome page
    if (requestPath === '/') {
      ctx.redirect(appendPath(endpoint, '/welcome').toString());

      return;
    }

    return next();
  };
}
