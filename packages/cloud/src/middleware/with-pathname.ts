import type {
  HttpContext,
  MiddlewareFunction,
  NextFunction,
  RequestContext,
} from '@withtyped/server';

import { matchPathname } from '#src/utils/url.js';

/**
 * Build a middleware function that conditionally runs the given middleware function when:
 *
 * - The current pathname matches the given pathname prefix; and
 * - `context.status` is unset (i.e. `undefined`).
 *
 * @param pathname The pathname prefix to match.
 * @param run The middleware function to run with the prefix matches.
 */
export default function withPathname<
  InputContext extends RequestContext,
  OutputContext extends RequestContext
>(pathname: string, run: MiddlewareFunction<InputContext, InputContext | OutputContext>) {
  return async (
    context: InputContext,
    next: NextFunction<InputContext | OutputContext>,
    httpContext: HttpContext
  ) => {
    if (context.status ?? !matchPathname(pathname, context.request.url.pathname)) {
      return next(context);
    }

    return run(context, next, httpContext);
  };
}
