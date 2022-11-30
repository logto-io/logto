import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import envSet from '#src/env-set/index.js';
import { appendPath } from '#src/utils/url.js';

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
