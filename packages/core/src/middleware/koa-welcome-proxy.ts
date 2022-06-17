import { MiddlewareType } from 'koa';
import { IRouterParamContext } from 'koa-router';

import { hasActiveUsers } from '@/queries/user';

export default function koaWelcomeProxy<
  StateT,
  ContextT extends IRouterParamContext,
  ResponseBodyT
>(): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return async (ctx) => {
    if (await hasActiveUsers()) {
      ctx.redirect('/console');

      return;
    }

    ctx.redirect('/console/welcome');
  };
}
