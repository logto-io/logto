import { type ParsedUrlQuery } from 'node:querystring';

import type { MiddlewareType } from 'koa';

const formUrlEncodedContentType = 'application/x-www-form-urlencoded';
const postCompatiblePaths = new Set(['/auth', '/session/end']);

const isStringOrStringArray = (value: unknown): value is string | string[] =>
  typeof value === 'string' ||
  (Array.isArray(value) && value.every((item) => typeof item === 'string'));

const isParsedUrlQuery = (value: unknown): value is ParsedUrlQuery =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((item) => isStringOrStringArray(item));

/**
 * Keeps form POST requests working for the authorization and logout endpoints after
 * `oidc-provider` routes them as GET-only. The request body is parsed before this middleware runs,
 * so it can be forwarded as query parameters to the provider's GET handlers.
 */
export default function koaOidcPostParams<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return async (ctx, next) => {
    const { body } = ctx.request;

    if (
      ctx.method === 'POST' &&
      postCompatiblePaths.has(ctx.path) &&
      ctx.is(formUrlEncodedContentType) &&
      isParsedUrlQuery(body)
    ) {
      const originalQuerystring = ctx.querystring;
      ctx.request.query = body;
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
