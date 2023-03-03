import cors from '@koa/cors';
import type { UrlSet } from '@logto/shared';
import type { MiddlewareType } from 'koa';

import { EnvSet } from '#src/env-set/index.js';

export default function koaCors<StateT, ContextT, ResponseBodyT>(
  ...urlSets: UrlSet[]
): MiddlewareType<StateT, ContextT, ResponseBodyT> {
  return cors({
    origin: (ctx) => {
      const { origin } = ctx.request.headers;

      if (
        origin &&
        urlSets.some((set) => {
          const deduplicated = set.deduplicated();

          // The URL Set has only one endpoint available, just use that endpoint.
          if (deduplicated.length <= 1) {
            return deduplicated.some((url) => url.origin === origin);
          }

          // For multiple endpoints, should filter out localhost in production.
          return deduplicated.some(
            (url) =>
              url.origin === origin &&
              // Disable localhost CORS in production since it's unsafe
              !(EnvSet.values.isProduction && url.hostname === 'localhost')
          );
        })
      ) {
        return origin;
      }

      return '';
    },
    exposeHeaders: '*',
  });
}
