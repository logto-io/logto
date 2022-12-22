import { Hooks } from '@logto/schemas/models';
import { createModelRouter } from '@withtyped/postgres';
import { koaAdapter, RequestError } from '@withtyped/server';
import type { MiddlewareType } from 'koa';
import koaBody from 'koa-body';

import envSet from '#src/env-set/index.js';
import LogtoRequestError from '#src/errors/RequestError/index.js';

import type { AuthedRouter } from './types.js';

// Organize this function if we decide to adopt withtyped eventually
const errorHandler: MiddlewareType = async (_, next) => {
  try {
    await next();
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw new LogtoRequestError(
        { code: 'request.general', status: error.status },
        error.original
      );
    }

    throw error;
  }
};

export default function hookRoutes<T extends AuthedRouter>(router: T) {
  const modelRouter = createModelRouter(Hooks, envSet.queryClient).withCrud();

  router.all('/hooks/(.*)?', koaBody(), errorHandler, koaAdapter(modelRouter.routes()));
}
