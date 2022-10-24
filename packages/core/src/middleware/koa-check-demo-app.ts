import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import type { MiddlewareType } from 'koa';

import { findApplicationById } from '@/queries/application';

export default function koaCheckDemoApp<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return async (ctx, next) => {
    try {
      await findApplicationById(demoAppApplicationId);

      await next();

      return;
    } catch {
      ctx.throw(404);
    }
  };
}
