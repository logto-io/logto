import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import type Queries from '#src/tenants/Queries.js';

export default function koaConsoleRedirectProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(queries: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { hasActiveUsers } = queries.users;

  return async (ctx, next) => {
    const hasUser = await hasActiveUsers();

    if ((ctx.path === '/' || ctx.path === '/console') && !hasUser) {
      ctx.redirect('/console/welcome');

      return;
    }

    if ((ctx.path === '/' || ctx.path === '/console/welcome') && hasUser) {
      ctx.redirect('/console');

      return;
    }

    return next();
  };
}
