import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import type { MiddlewareType } from 'koa';

import { findApplicationById } from '#src/queries/application.js';

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
