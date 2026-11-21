import { Stream } from 'node:stream';

import type { Nullable } from '@silverhand/essentials';
import etag from 'etag';
import type { Method } from 'got';
import type { MiddlewareType } from 'koa';

/**
 * Create a middleware function that calculates the ETag value based on response body,
 * and set status code to `304` and body to `null` if needed.
 *
 * Streaming bodies are skipped: their bytes are not available synchronously, so
 * `JSON.stringify` would hash the stream object rather than the representation and different
 * downloads could share an ETag.
 *
 * @param methods An array of methods to match
 * @default methods ['GET']
 */
export default function koaBodyEtag<StateT, ContextT, ResponseBodyT>(
  methods: Array<Uppercase<Method>> = ['GET']
): MiddlewareType<StateT, ContextT, Nullable<ResponseBodyT>> {
  const methodSet = new Set<string>(methods);

  return async (ctx, next) => {
    await next();

    if (methodSet.has(ctx.method) && ctx.body && !(ctx.body instanceof Stream)) {
      ctx.response.etag = etag(JSON.stringify(ctx.body));

      if (ctx.fresh) {
        ctx.status = 304;
        ctx.body = null;
      }
    }
  };
}
