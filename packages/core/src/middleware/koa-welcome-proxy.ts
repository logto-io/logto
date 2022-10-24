import type { MiddlewareType } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import envSet from '@/env-set';
import { hasActiveUsers } from '@/queries/user';
import { appendPath } from '@/utils/url';

export default function koaWelcomeProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { adminConsoleUrl } = envSet.values;

  return async (ctx) => {
    if (await hasActiveUsers()) {
      ctx.redirect(adminConsoleUrl.toString());

      return;
    }

    ctx.redirect(appendPath(adminConsoleUrl, '/welcome').toString());
  };
}
