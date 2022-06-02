import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';

import { MountedApps } from '@/env-set';

export default function koaRootProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx, next) => {
    const requestPath = ctx.request.path;

    // Empty path Redirect
    if (requestPath === '/') {
      ctx.redirect(`/${MountedApps.Console}`);

      return;
    }

    return next();
  };
}
