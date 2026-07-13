import { type ExceptionTelemetry } from '@logto/app-insights/node';
import { type ExtendableContext, type Request } from 'koa';

/**
 * Get the origin (`protocol://host`) of the incoming request, honoring the active custom domain.
 *
 * Do not use `request.origin` as a substitute: in Koa 3 it returns the request's `Origin` header
 * (or `null`), while `request.URL` is still built from the request's protocol and host.
 *
 * Koa memoizes a null-prototype object when the request URL cannot be parsed (e.g. a malformed
 * `Host` header), which makes `URL.origin` `undefined` at runtime despite what its type says.
 * Return `undefined` in that case so callers can degrade to a relative URL instead of
 * interpolating `undefined` into the URLs they build.
 */
export const getRequestOrigin = (request: Pick<Request, 'URL'>): string | undefined =>
  request.URL.origin || undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
const getRequestIdFromContext = (context: object): string | undefined => {
  if ('requestId' in context && typeof context.requestId === 'string') {
    return context.requestId;
  }
};

export const buildAppInsightsTelemetry = (
  context: ExtendableContext
): Partial<ExceptionTelemetry> => {
  const requestId = getRequestIdFromContext(context);
  const {
    host,
    'x-forwarded-proto': xForwardedProto,
    'x-forwarded-host': xForwardedHost,
  } = context.headers;

  return {
    properties: {
      requestId,
      host,
      xForwardedProto,
      xForwardedHost,
    },
  };
};
