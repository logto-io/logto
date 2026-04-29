import type { MiddlewareType } from 'koa';

export const cacheControlHeader = 'Cache-Control';

export const jwksPath = '/jwks';

export const jwksBrowserCacheControl = 'no-cache, max-age=0, must-revalidate';

export default function koaJwksCacheControl<StateT, ContextT>(): MiddlewareType<StateT, ContextT> {
  return async (ctx, next) => {
    await next();

    if (ctx.method === 'GET' && ctx.path === jwksPath) {
      ctx.set(cacheControlHeader, jwksBrowserCacheControl);
    }
  };
}
