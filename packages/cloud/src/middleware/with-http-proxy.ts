import type { HttpContext, NextFunction, RequestContext } from '@withtyped/server';
import type { ServerOptions } from 'http-proxy';
import HttpProxy from 'http-proxy';

import { matchPathname } from '#src/utils/url.js';

const { createProxy } = HttpProxy;

export default function withHttpProxy<InputContext extends RequestContext>(
  pathname: string,
  options: ServerOptions
) {
  const proxy = createProxy(options);

  return async (
    context: InputContext,
    next: NextFunction<InputContext>,
    { request, response }: HttpContext
  ) => {
    const {
      request: { url },
    } = context;

    const matched = matchPathname(pathname, url.pathname);

    if (!matched) {
      return next(context);
    }

    await new Promise<void>((resolve) => {
      proxy.web(request, response, options);
      proxy.on('proxyRes', (_, __, response) => {
        response.on('end', resolve);
      });
    });

    return next({ ...context, status: 'ignore' });
  };
}

export type { ServerOptions } from 'http-proxy';
