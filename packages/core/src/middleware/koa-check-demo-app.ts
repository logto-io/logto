import { demoAppApplicationId } from '@logto/schemas';
import type { MiddlewareType } from 'koa';

import type Queries from '#src/tenants/Queries.js';

export default function koaCheckDemoApp<StateT, ContextT, ResponseBodyT>(
  queries: Queries
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  const { findApplicationById } = queries.applications;

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
