import type { Nullable } from '@silverhand/essentials';
import etag from 'etag';
import type { Method } from 'got';
import type { MiddlewareType } from 'koa';

/**
 * Create a middleware function that calculates the ETag value based on response body,
 * and set status code to `304` and body to `null` if needed.
 *
 * @param methods An array of methods to match
 * @default methods ['GET']
 */
export default function koaBodyEtag<StateT, ContextT, ResponseBodyT>(
  methods: Array<Uppercase<Method>> = ['GET']
): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  return async (ctx, next) => {
    await next();

    // eslint-disable-next-line no-restricted-syntax
    if (methods.includes(ctx.method as Uppercase<Method>)) {
      ctx.response.etag = etag(JSON.stringify(ctx.body));

      if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
      }
    }
  };
}
