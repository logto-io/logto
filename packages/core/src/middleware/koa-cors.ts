import cors from '@koa/cors';
import type { MiddlewareType } from 'koa';

import type UrlSet from '#src/env-set/UrlSet.js';

export default function koaCors<StateT, ContextT, ResponseBodyT>(
  ...urlSets: UrlSet[]
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return cors({
    origin: (ctx) => {
      const { origin } = ctx.request.headers;

      return origin &&
        urlSets
          .flatMap((set) => set.deduplicated())
          .some((value) => new URL(value).origin === origin)
        ? origin
        : '';
    },
    exposeHeaders: '*',
  });
}
