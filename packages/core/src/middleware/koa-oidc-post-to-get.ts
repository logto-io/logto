import { type ParsedUrlQuery } from 'node:querystring';

import { type Optional } from '@silverhand/essentials';
import type { MiddlewareType } from 'koa';

const formUrlEncodedContentType = 'application/x-www-form-urlencoded';
const postCompatiblePaths = new Set(['/auth', '/session/end']);

const isScalar = (value: unknown): value is string | number | boolean =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

const toQueryValue = (value: unknown): Optional<string | string[]> => {
  if (isScalar(value)) {
    return String(value);
  }

  if (Array.isArray(value) && value.every((item) => isScalar(item))) {
    return value.map(String);
  }
};

/**
 * Converts the parsed request body into query-compatible parameters, serializing scalar values
 * the way a form submission would express them (e.g. `300` from a JSON body becomes `'300'`).
 * Returns `undefined` when the body carries values a form cannot express (nested objects, `null`,
 * non-scalar array items), in which case the request should be left untouched.
 */
const toQueryParams = (body: unknown): Optional<ParsedUrlQuery> => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return;
  }

  const entries = Object.entries(body).map(([key, value]) => [key, toQueryValue(value)] as const);

  if (entries.some(([, value]) => value === undefined)) {
    return;
  }

  return Object.fromEntries(entries);
};

/**
 * Forwards form POST requests for the authorization and logout endpoints to their GET handlers by
 * moving the parsed request body into the query string and rewriting the method to `GET`.
 *
 * `oidc-provider` v9 removes the default POST routes for these endpoints, and enabling its
 * built-in POST support requires `SameSite=None` session cookies while Logto intentionally uses
 * `SameSite=Lax`. The request body is parsed before this middleware runs, so it can be forwarded
 * as query parameters instead. The original method and query string are restored after downstream
 * processing, so upstream middleware and access logs observe the actual request.
 */
export default function koaOidcPostToGet<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return async (ctx, next) => {
    const query =
      ctx.method === 'POST' &&
      postCompatiblePaths.has(ctx.path) &&
      ctx.is(formUrlEncodedContentType)
        ? toQueryParams(ctx.request.body)
        : undefined;

    if (query) {
      const originalQuerystring = ctx.querystring;
      ctx.request.query = query;
      ctx.method = 'GET';

      try {
        await next();
      } finally {
        /**
         * Keep access logs and upstream middleware aligned with the actual request. Restoring the
         * query string also removes the forwarded body parameters (which may carry tokens such as
         * `id_token_hint`) from the request URL, so upstream code never observes them there.
         */
        ctx.method = 'POST';
        ctx.querystring = originalQuerystring;
      }

      return;
    }

    return next();
  };
}
