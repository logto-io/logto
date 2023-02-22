import path from 'path';

import { ossConsolePath } from '@logto/schemas';
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

    if ((ctx.path === '/' || ctx.path === ossConsolePath) && !hasUser) {
      ctx.redirect(path.join(ossConsolePath, '/welcome'));

      return;
    }

    if ((ctx.path === '/' || ctx.path === path.join(ossConsolePath, '/welcome')) && hasUser) {
      ctx.redirect(ossConsolePath);

      return;
    }

    return next();
  };
}
