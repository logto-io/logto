import { koaAdapter, RequestError } from '@withtyped/server';
import type { MiddlewareType } from 'koa';
import koaBody from 'koa-body';

import LogtoRequestError from '#src/errors/RequestError/index.js';
import modelRouters from '#src/model-routers/index.js';

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
  router.all('/hooks/(.*)?', koaBody(), errorHandler, koaAdapter(modelRouters.hook.routes()));
}
