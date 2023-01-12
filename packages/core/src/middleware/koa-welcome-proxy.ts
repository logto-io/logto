import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { appendPath } from '#src/utils/url.js';

export default function koaWelcomeProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(queries: Queries): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { hasActiveUsers } = queries.users;
  const { adminConsoleUrl } = EnvSet.values;

  return async (ctx) => {
    if (await hasActiveUsers()) {
      ctx.redirect(adminConsoleUrl.toString());

      return;
    }

    ctx.redirect(appendPath(adminConsoleUrl, '/welcome').toString());
  };
}
