import cors from '@koa/cors';
import type { MiddlewareType } from 'koa';

import type UrlSet from '#src/env-set/UrlSet.js';
import { EnvSet } from '#src/env-set/index.js';

export default function koaCors<StateT, ContextT, ResponseBodyT>(
  ...urlSets: UrlSet[]
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return cors({
    origin: (ctx) => {
      const { origin } = ctx.request.headers;

      if (
        origin &&
        urlSets.some((set) =>
          set.deduplicated().some(
            (url) =>
              url.origin === origin &&
              // Disable localhost CORS in production since it's unsafe
              !(EnvSet.values.isProduction && url.hostname === 'localhost')
          )
        )
      ) {
        return origin;
      }

      return '';
    },
    exposeHeaders: '*',
  });
}
